/*
 更新时间: 2026-07-08 14:30:00 CST
 更新内容: 修复日期单元格月份错位（9 月被识别成 8 月）。
          根因：xlsx cellDates:true 把 Excel 日期格构造成带时区的 JS Date，
          在 UTC+8 等时区叠加 1900 闰年修正后，getMonth() 会把「9 月 1 日」拉到「8 月 31 日」。
          改为 cellDates:false 让日期格以 Excel 序列号（纯数字）读出，再用与时区无关的
          序列号→年月日换算；Date / ISO 串分支一并改为 UTC 取值作防御。
*/
/*
 更新时间: 2026-07-07 10:00:00 CST
 更新内容: 新增 Excel 导入纯函数逻辑（读取/抽取/映射校验/模板生成/下载），完全由配置驱动，
          前端与后端共享，不含任何硬编码列名。
*/
import * as XLSX from 'xlsx';

/**
 * 读取 Excel 文件为 workbook。
 * 注意：刻意不使用 cellDates。Excel 日期格本身没有时区，cellDates:true 会让 xlsx 用本地时区
 * 构造 JS Date，再叠加 1900 闰年修正，在 UTC+8 等时区下会把「9 月 1 日」错算成「8 月 31 日」。
 * 关闭后日期格以 Excel 序列号（纯数字）读出，由 excelSerialToYMD 做与时区无关的换算。
 */
export async function readWorkbook(file) {
  const buffer = await file.arrayBuffer();
  return XLSX.read(buffer, { type: 'array', cellDates: false });
}

/** 取 workbook 的所有 sheet 名。 */
export function getSheetNames(workbook) {
  return workbook?.SheetNames ?? [];
}

/**
 * 从 workbook 抽取一个 sheet 的表头与数据行。
 * @param {object} workbook
 * @param {string|null} sheetName 指定 sheet 名；null/未找到时取第一个 sheet
 * @returns {{ headers:string[], rawRows:any[][], usedSheetName:string }}
 */
export function extractRows(workbook, sheetName = null) {
  const names = getSheetNames(workbook);
  if (!names.length) return { headers: [], rawRows: [], usedSheetName: '' };
  const used = sheetName && names.includes(sheetName) ? sheetName : names[0];
  const sheet = workbook.Sheets[used];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: null });
  if (!matrix.length) return { headers: [], rawRows: [], usedSheetName: used };
  const [headerRow, ...rest] = matrix;
  const headers = headerRow.map((cell) => (cell == null ? '' : String(cell).trim()));
  const maxLen = headers.length;
  // 补齐每行长度，避免短行错位
  const rawRows = rest.map((row) => {
    const out = new Array(maxLen).fill(null);
    for (let i = 0; i < maxLen; i++) out[i] = row[i] ?? null;
    return out;
  });
  return { headers, rawRows, usedSheetName: used };
}

function normalizeHeader(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, '');
}

/** 为每个配置列找到在 Excel 表头中的列索引（按 header / aliases 匹配，忽略大小写与空白）。 */
export function matchColumns(rawHeaders, config) {
  const normalized = rawHeaders.map(normalizeHeader);
  const matched = {};
  const missing = [];
  for (const col of config.columns) {
    const candidates = [col.header, ...(col.aliases ?? [])].map(normalizeHeader);
    let idx = -1;
    for (let i = 0; i < normalized.length; i++) {
      if (candidates.includes(normalized[i])) {
        idx = i;
        break;
      }
    }
    if (idx === -1) {
      missing.push(col);
    } else {
      matched[col.field] = { index: idx, header: String(rawHeaders[idx]).trim() };
    }
  }
  return { matched, missing };
}

function isEmpty(value) {
  return value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '');
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  const s = String(value).trim().toLowerCase();
  if (['是', 'true', '1', 'y', 'yes', '✓'].includes(s)) return true;
  if (['否', 'false', '0', 'n', 'no', ''].includes(s)) return false;
  throw new Error(`无法识别为是/否：${value}`);
}

function toNumber(value) {
  if (typeof value === 'number') return value;
  const s = String(value).trim().replace(/,/g, '').replace(/(万元?|元|个|单)$/i, '');
  const n = Number(s);
  if (Number.isNaN(n)) throw new Error(`不是合法数字：${value}`);
  return n;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Excel 序列号 -> { y, m, d }（与时区无关的纯整数换算）。
 * xlsx（cellDates:false）读出的日期格 v 即 Excel 1900 日期系统的序列号：
 * 以 1899-12-30 为 serial=0 基准，serial*1天 按 UTC 整天换算即可还原日历日期，
 * 全程不碰本地时区（经实测：serial 46266 == 2026-09-01）。
 * 仅当换算出的年份落在业务区间 [2000, 2100] 内才视为合法日期，避免把误填的纯小数字（如 9）
 * 当成 1900 年的序列号静默通过。
 */
function excelSerialToYMD(serial) {
  const s = Number(serial);
  if (!Number.isFinite(s)) return null;
  const epochMs = Date.UTC(1899, 11, 30); // 1899-12-30 00:00 UTC == serial 0
  const d = new Date(epochMs + Math.floor(s) * 86400000);
  const y = d.getUTCFullYear();
  if (y < 2000 || y > 2100) return null;
  return { y, m: d.getUTCMonth() + 1, d: d.getUTCDate() };
}

/**
 * 把一个表示“某一天”的 JS Date instant 归一化为 { y, m, d }。
 * Excel 日期格没有时区，但 xlsx/cellDates 会把它构造成本地时区的 Date，再叠加 1900 修正，
 * 导致 instant 落在前后一天的 15:59 / 16:00 附近。按 UTC 整天四舍五入恢复原日历日期。
 */
function instantToYMD(date) {
  const day = Math.round(date.getTime() / 86400000);
  const d = new Date(day * 86400000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
}

function toDateMonth(value, withDay) {
  // Excel 日期单元格以序列号读出（cellDates:false）—— 与时区无关，最可靠。
  if (typeof value === 'number' && Number.isFinite(value)) {
    const ymd = excelSerialToYMD(value);
    if (ymd) {
      if (withDay) return `${ymd.y}-${pad2(ymd.m)}-${pad2(ymd.d)}`;
      return `${ymd.y}-${pad2(ymd.m)}`;
    }
  }
  // JS Date（万一别处开启 cellDates）—— 按 UTC 整天四舍五入，避免本地时区拉偏月份。
  if (value instanceof Date) {
    const ymd = instantToYMD(value);
    if (withDay) return `${ymd.y}-${pad2(ymd.m)}-${pad2(ymd.d)}`;
    return `${ymd.y}-${pad2(ymd.m)}`;
  }
  const s = String(value).trim();
  // 经 JSON 序列化传到后端的 ISO 时间串（如 2026-08-31T15:59:17.000Z），同样存在时区偏移，
  // 按 instant 归一化，避免字符串前缀正好落在错的那一天。
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const parsed = new Date(s);
    if (!Number.isNaN(parsed.getTime())) {
      const ymd = instantToYMD(parsed);
      if (withDay) return `${ymd.y}-${pad2(ymd.m)}-${pad2(ymd.d)}`;
      return `${ymd.y}-${pad2(ymd.m)}`;
    }
  }
  // 用户手填的纯文本：2026-03 / 2026/03 / 2026.03 / 2026年3月
  const m = s.match(/^(\d{4})\s*[-/.年]\s*(\d{1,2})/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    if (mo >= 1 && mo <= 12) return `${y}-${pad2(mo)}`;
  }
  // 2026-03-15
  if (withDay) {
    const d = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (d) return `${d[1]}-${pad2(Number(d[2]))}-${pad2(Number(d[3]))}`;
  }
  throw new Error(`不是合法${withDay ? '日期' : '月份'}：${value}`);
}

function coerceValue(col, value) {
  switch (col.type) {
    case 'number': {
      const n = toNumber(value);
      if (col.min != null && n < col.min) throw new Error(`小于最小值 ${col.min}：${n}`);
      if (col.max != null && n > col.max) throw new Error(`大于最大值 ${col.max}：${n}`);
      return n;
    }
    case 'boolean':
      return toBoolean(value);
    case 'month':
      return toDateMonth(value, false);
    case 'date':
      return toDateMonth(value, true);
    case 'string':
    default:
      return String(value).trim();
  }
}

/**
 * 把 Excel 原始行映射为配置字段对象，并做类型转换 / 必填 / 范围 / 去重校验。
 * @returns {{ rows:object[], errors:{row:number,field:string,message:string}[], warnings:string[], matchedColumns:object, missingColumns:object[] }}
 */
export function mapAndValidate(rawHeaders, rawRows, config) {
  const { matched, missing } = matchColumns(rawHeaders, config);
  const rows = [];
  const errors = [];
  const warnings = [];
  const seen = new Map(); // uniqueKey -> first row index

  // 必填列整列缺失 -> 阻断导入的错误；可选列缺失 -> 仅提示
  const missingRequired = missing.filter((c) => c.required);
  const missingOptional = missing.filter((c) => !c.required);
  if (missingOptional.length) {
    warnings.push(`以下可选列未在 Excel 中找到（将被忽略）：${missingOptional.map((c) => c.header).join('、')}`);
  }
  for (const col of missingRequired) {
    errors.push({ row: 0, field: col.field, message: `必填列【${col.header}】未在 Excel 表头中找到` });
  }

  rawRows.forEach((rawRow, rowIdx) => {
    const displayRowNo = rowIdx + 2; // Excel 行号（含表头）
    const matchedCells = {};
    let hasAnyValue = false;
    for (const col of config.columns) {
      const match = matched[col.field];
      if (!match) continue;
      const cell = rawRow[match.index];
      matchedCells[col.field] = cell;
      if (!isEmpty(cell)) hasAnyValue = true;
    }

    // 整行空行：直接跳过，不报必填错误
    if (!hasAnyValue) return;

    const obj = {};
    for (const col of config.columns) {
      const match = matched[col.field];
      if (!match) continue;
      const cell = matchedCells[col.field];
      if (isEmpty(cell)) {
        if (col.required) {
          errors.push({ row: displayRowNo, field: col.field, message: `必填列【${col.header}】为空` });
        }
        continue;
      }
      try {
        obj[col.field] = coerceValue(col, cell);
      } catch (err) {
        errors.push({ row: displayRowNo, field: col.field, message: `列【${col.header}】${err.message}` });
      }
    }

    // 去重判定
    if (config.uniqueKey?.length) {
      const keyFields = config.uniqueKey.filter((f) => matched[f]);
      if (keyFields.length === config.uniqueKey.length) {
        const key = keyFields.map((f) => obj[f]).join('||');
        if (seen.has(key)) {
          errors.push({ row: displayRowNo, field: keyFields.join(','), message: `与第 ${seen.get(key)} 行重复（${config.uniqueKey.join('+')}）` });
        } else {
          seen.set(key, displayRowNo);
        }
      }
    }

    rows.push(obj);
  });

  return { rows, errors, warnings, matchedColumns: matched, missingColumns: missing };
}

/** 示例行：每个配置列给一个占位示例值，供模板参考。 */
function sampleValue(col) {
  switch (col.type) {
    case 'number': return col.min ?? 0;
    case 'boolean': return '是';
    case 'month': return '2026-03';
    case 'date': return '2026-03-15';
    case 'string':
    default: return `示例${col.header}`;
  }
}

/** 生成模板 workbook（表头行 + 一行示例 + 说明 sheet），返回 ArrayBuffer。 */
export function buildTemplateWorkbook(config) {
  const headerRow = config.columns.map((c) => c.header);
  const sampleRow = config.columns.map((c) => sampleValue(c));
  const mainSheet = XLSX.utils.aoa_to_sheet([headerRow, sampleRow]);
  // 列宽
  mainSheet['!cols'] = config.columns.map((c) => ({ wch: Math.max(12, c.header.length * 2 + 4) }));

  const descHeader = ['列名(字段)', '表头文案', '类型', '必填', '说明'];
  const descRows = config.columns.map((c) => [c.field, c.header, c.type || 'string', c.required ? '是' : '否', c.description || '']);
  if (config.notes) descRows.push([], ['备注', config.notes, '', '', '']);
  const descSheet = XLSX.utils.aoa_to_sheet([descHeader, ...descRows]);
  descSheet['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 10 }, { wch: 8 }, { wch: 48 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, mainSheet, '导入数据');
  XLSX.utils.book_append_sheet(wb, descSheet, '说明');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

function appendTemplateSheets(wb, config) {
  const headerRow = config.columns.map((c) => c.header);
  const sampleRow = config.columns.map((c) => sampleValue(c));
  const mainSheet = XLSX.utils.aoa_to_sheet([headerRow, sampleRow]);
  mainSheet['!cols'] = config.columns.map((c) => ({ wch: Math.max(12, c.header.length * 2 + 4) }));
  XLSX.utils.book_append_sheet(wb, mainSheet, config.sheetName || config.label || config.pageKey);
}

export function buildTemplateBundleWorkbook(configs) {
  const wb = XLSX.utils.book_new();
  configs.forEach((config) => appendTemplateSheets(wb, config));

  const descRows = [['模板', '列名(字段)', '表头文案', '类型', '必填', '说明']];
  configs.forEach((config) => {
    config.columns.forEach((c) => {
      descRows.push([config.label, c.field, c.header, c.type || 'string', c.required ? '是' : '否', c.description || '']);
    });
    if (config.notes) descRows.push([config.label, '备注', config.notes, '', '', '']);
  });
  const descSheet = XLSX.utils.aoa_to_sheet(descRows);
  descSheet['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 16 }, { wch: 10 }, { wch: 8 }, { wch: 52 }];
  XLSX.utils.book_append_sheet(wb, descSheet, '说明');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

/** 触发浏览器下载模板 .xlsx。仅在浏览器环境调用。 */
export function downloadTemplate(config) {
  const bytes = buildTemplateWorkbook(config);
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.fileName || `${config.pageKey}-模板`}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadTemplateBundle(configs, fileName = '目标维护-组织目标和实际完成模板') {
  const bytes = buildTemplateBundleWorkbook(configs);
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
