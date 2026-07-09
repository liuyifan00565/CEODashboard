/*
 Update time: 2026-07-09 14:42:00 CST
 Update content: Make target maintenance import dialog download the two-sheet target template bundle instead of the default single template.
*/
/*
 更新时间: 2026-07-08 13:05:31 CST
 更新内容: 目标导入遇到未找到员工时展示新增员工确认项，确认后携带新增员工选项再次提交并刷新维护数据。
*/
/*
 更新时间: 2026-07-08 11:28:12 CST
 更新内容: 将 Excel 导入弹窗的工作表原生下拉替换为 GlassSelect，避免多工作表选择时出现系统白底下拉。
*/
/*
 更新时间: 2026-07-07 10:00:00 CST
 更新内容: 新增数据维护 Excel 导入弹窗，完全由配置驱动：选文件/解析/列映射预览/错误/确认上传空跑。
*/
import { useMemo, useRef, useState } from 'react';

import {
  readWorkbook,
  getSheetNames,
  extractRows,
  mapAndValidate,
  matchColumns,
  downloadTemplate,
  downloadTemplateBundle,
} from '../lib/excelImport.js';
import './MaintenanceImportDialog.css';
import GlassSelect from './GlassSelect.jsx';

const PREVIEW_ROWS = 8;

function statusBadge(ok, text) {
  return <span className={`mnt-import-badge${ok ? ' mnt-import-badge--ok' : ' mnt-import-badge--err'}`}>{text}</span>;
}

function detectImportConfig(rawHeaders, candidates, fallback) {
  if (!candidates?.length) return fallback;
  let best = fallback ?? candidates[0];
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const candidate of candidates) {
    const { matched, missing } = matchColumns(rawHeaders, candidate);
    const requiredMissing = missing.filter((col) => col.required).length;
    const requiredMatched = candidate.columns.filter((col) => col.required && matched[col.field]).length;
    const optionalMatched = candidate.columns.filter((col) => !col.required && matched[col.field]).length;
    const score = requiredMatched * 20 + optionalMatched * 3 - requiredMissing * 30;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

function hasRequiredMatch(rawHeaders, config) {
  const { matched } = matchColumns(rawHeaders, config);
  return config.columns.some((col) => col.required && matched[col.field]);
}

export default function MaintenanceImportDialog({ config, configs, onClose, onImported }) {
  const importConfigs = useMemo(() => (configs?.length ? configs : [config].filter(Boolean)), [config, configs]);
  const fileInputRef = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle | parsed | submitting | done
  const [activeConfigKey, setActiveConfigKey] = useState(config?.pageKey ?? importConfigs[0]?.pageKey ?? '');
  const [fileName, setFileName] = useState('');
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);
  const activeConfig = useMemo(
    () => importConfigs.find((item) => item?.pageKey === activeConfigKey) ?? importConfigs[0] ?? config,
    [activeConfigKey, config, importConfigs],
  );

  const mapResult = useMemo(
    () => (rawHeaders.length && activeConfig ? mapAndValidate(rawHeaders, rawRows, activeConfig) : null),
    [rawHeaders, rawRows, activeConfig],
  );

  const hasErrors = mapResult?.errors?.length > 0;
  const previewRows = mapResult?.rows?.slice(0, PREVIEW_ROWS) ?? [];
  const pendingNewStaff = result?.pendingNewStaff ?? [];
  const sheetOptions = useMemo(
    () => sheetNames.map((name) => ({ value: name, label: name })),
    [sheetNames],
  );
  const configOptions = useMemo(
    () => importConfigs.map((item) => ({ value: item.pageKey, label: item.label })),
    [importConfigs],
  );

  function handleDownloadTemplate() {
    if (importConfigs.length > 1) {
      downloadTemplateBundle(importConfigs);
      return;
    }
    if (activeConfig) downloadTemplate(activeConfig);
  }

  async function handleFile(file) {
    if (!file) return;
    setParseError('');
    setFileName(file.name);
    try {
      const wb = await readWorkbook(file);
      const names = getSheetNames(wb);
      if (!names.length) {
        setParseError('文件中没有工作表');
        return;
      }
      setWorkbook(wb);
      setSheetNames(names);
      const initial = (activeConfig?.sheetName && names.includes(activeConfig.sheetName)) ? activeConfig.sheetName : names[0];
      setSheetName(initial);
      loadSheet(wb, initial);
      setPhase('parsed');
      setResult(null);
    } catch (err) {
      setParseError(`解析失败：${err.message}（请确认是 .xlsx/.xls 文件）`);
      setPhase('idle');
    }
  }

  function loadSheet(wb, name) {
    const { headers, rawRows: rows } = extractRows(wb, name);
    setRawHeaders(headers);
    setRawRows(rows);
    const detected = detectImportConfig(headers, importConfigs, activeConfig);
    if (detected?.pageKey) setActiveConfigKey(detected.pageKey);
  }

  function handleSheetChange(name) {
    setSheetName(name);
    if (workbook) loadSheet(workbook, name);
  }

  async function handleConfirm(options = {}) {
    if (!activeConfig || hasErrors) return;
    const createMissingStaff = options?.createMissingStaff === true;
    setPhase('submitting');
    setSubmitError('');
    try {
      const imports = [];
      if (workbook && importConfigs.length > 1) {
        for (const name of sheetNames) {
          const { headers, rawRows: rows } = extractRows(workbook, name);
          const detected = detectImportConfig(headers, importConfigs, null);
          if (!detected || !hasRequiredMatch(headers, detected)) continue;
          imports.push({ pageKey: detected.pageKey, meta: { sheetName: name }, rawHeaders: headers, rawRows: rows });
        }
      }
      if (importConfigs.length > 1 && imports.length === 0) {
        setSubmitError('未在 Excel 中识别到“组织目标”或“组织实际完成”工作表，请重新下载模板后填写。');
        setPhase('parsed');
        return;
      }
      const resp = await fetch('/api/maintenance/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imports.length ? {
          imports,
          options: { createMissingTargetStaff: createMissingStaff },
        } : {
          pageKey: activeConfig.pageKey,
          meta: { sheetName },
          rawHeaders,
          rawRows,
          rows: mapResult.rows,
          options: { createMissingTargetStaff: createMissingStaff },
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setSubmitError(data?.error || `上传失败（${resp.status}）`);
        setPhase('parsed');
        return;
      }
      setResult(data);
      setPhase('done');
      if ((data.written ?? 0) > 0 || (data.createdStaff ?? 0) > 0) onImported?.();
    } catch (err) {
      setSubmitError(`网络异常：${err.message}`);
      setPhase('parsed');
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }

  function handleDropOver(event) {
    event.preventDefault();
  }

  return (
    <div className="mnt-import-overlay" role="dialog" aria-label={activeConfig?.label || 'Excel 导入'}>
      <div className="mnt-import-mask" onClick={onClose} />
      <div className="mnt-import-card">
        <header className="mnt-import-head">
          <div>
            <h3>{activeConfig?.label || 'Excel 导入'}</h3>
            {activeConfig?.notes && <p className="mnt-import-notes">{activeConfig.notes}</p>}
          </div>
          <button className="mnt-btn" type="button" onClick={onClose}>关闭</button>
        </header>

        <div className="mnt-import-body">
          {phase === 'idle' && (
            <div
              className="mnt-import-dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDropOver}
            >
              <p>点击或拖拽 .xlsx / .xls 文件到这里</p>
              <span className="mnt-import-hint">未选好文件？可先</span>
              <button
                className="mnt-btn"
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDownloadTemplate(); }}
              >
                下载模板
              </button>
              {parseError && <p className="mnt-import-error">{parseError}</p>}
              <input
                ref={fileInputRef}
                className="mnt-import-file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          )}

          {phase !== 'idle' && (
            <>
              <div className="mnt-import-filebar">
                <span className="mnt-import-filename">{fileName}</span>
                {sheetNames.length > 1 && (
                  <label className="mnt-import-sheet">
                    工作表：
                    <GlassSelect className="mnt-control" value={sheetName} onChange={handleSheetChange} aria-label="选择工作表" options={sheetOptions} />
                  </label>
                )}
                {configOptions.length > 1 && (
                  <label className="mnt-import-sheet">
                    模板类型：
                    <GlassSelect className="mnt-control" value={activeConfig?.pageKey} onChange={setActiveConfigKey} aria-label="选择模板类型" options={configOptions} />
                  </label>
                )}
                <button
                  className="mnt-btn"
                  type="button"
                  onClick={() => { setPhase('idle'); setFileName(''); setRawHeaders([]); setRawRows([]); setResult(null); setParseError(''); }}
                >
                  重新选择
                </button>
              </div>

              {mapResult?.warnings?.map((w, i) => (
                <p key={i} className="mnt-import-warning">{w}</p>
              ))}

              <section className="mnt-import-section">
                <h4>列映射</h4>
                <table className="mnt-import-map">
                  <thead>
                    <tr><th>字段</th><th>Excel 表头</th><th>必填</th><th>类型</th><th>状态</th></tr>
                  </thead>
                  <tbody>
                    {activeConfig.columns.map((col) => {
                      const matched = mapResult.matchedColumns[col.field];
                      return (
                        <tr key={col.field}>
                          <td><code>{col.field}</code></td>
                          <td>{matched?.header || '—'}</td>
                          <td>{col.required ? '是' : '否'}</td>
                          <td>{col.type || 'string'}</td>
                          <td>{matched ? statusBadge(true, '已匹配') : statusBadge(false, '未匹配')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>

              {hasErrors && (
                <section className="mnt-import-section">
                  <h4>校验错误（{mapResult.errors.length}）</h4>
                  <ul className="mnt-import-errors">
                    {mapResult.errors.slice(0, 50).map((e, i) => (
                      <li key={i}>{e.row ? `第 ${e.row} 行 · ` : ''}{e.field}：{e.message}</li>
                    ))}
                    {mapResult.errors.length > 50 && <li>……还有 {mapResult.errors.length - 50} 条</li>}
                  </ul>
                </section>
              )}

              <section className="mnt-import-section">
                <h4>预览（前 {PREVIEW_ROWS} 行映射后数据）</h4>
                {previewRows.length ? (
                  <div className="mnt-import-preview-wrap">
                    <table className="mnt-import-preview">
                      <thead>
                        <tr>{activeConfig.columns.map((c) => <th key={c.field}>{c.header}</th>)}</tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i}>
                            {activeConfig.columns.map((c) => <td key={c.field}>{row[c.field] ?? '—'}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="mnt-import-hint">没有可预览的行</p>}
                <p className="mnt-import-summary">
                  共解析 {mapResult.rows.length} 行数据，
                  {hasErrors ? statusBadge(false, `${mapResult.errors.length} 行错误`) : statusBadge(true, '校验通过')}
                </p>
              </section>
            </>
          )}

          {phase === 'done' && result && (
            <section className="mnt-import-section mnt-import-result">
              <h4>导入结果{result.dryRun ? '（空跑）' : ''}</h4>
              <p className="mnt-import-summary">
                {result.dryRun
                  ? statusBadge(false, '空跑未写库')
                  : statusBadge(true, `已写库 ${result.written ?? 0} 行`)}
                {result.skipped > 0 && statusBadge(false, `跳过 ${result.skipped} 行`)}
                · 接收 {result.accepted} 行，拒绝 {result.rejected} 行，共 {result.totalRows} 行
              </p>
              <p className="mnt-import-hint">{result.summary}</p>
              {pendingNewStaff.length > 0 && (
                <div className="mnt-import-pending">
                  <h5>新增员工确认</h5>
                  <p>以下人员不在 Excel 填写的组织里，确认后会新增为启用销售员工，并继续导入本次目标。</p>
                  <ul>
                    {pendingNewStaff.map((item, i) => (
                      <li key={`${item.staff_name || 'staff'}-${item.department_name || 'dept'}-${i}`}>
                        {item.message || `员工「${item.staff_name}」并不在「${item.department_name || '未填写组织'}」组织里，是否新增员工？`}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mnt-btn mnt-btn--primary"
                    type="button"
                    onClick={() => handleConfirm({ createMissingStaff: true })}
                    disabled={phase === 'submitting'}
                  >
                    新增员工并继续导入
                  </button>
                </div>
              )}
              {result.errors?.length > 0 && (
                <ul className="mnt-import-errors">
                  {result.errors.slice(0, 20).map((e, i) => (
                    <li key={i}>{e.row ? `第 ${e.row} 行 · ` : ''}{e.field ? `${e.field}：` : ''}{e.message}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {submitError && <p className="mnt-import-error">{submitError}</p>}
        </div>

        <footer className="mnt-import-foot">
          <button className="mnt-btn" type="button" onClick={onClose}>{phase === 'done' ? '完成' : '取消'}</button>
          <button
            className="mnt-btn"
            type="button"
            onClick={handleDownloadTemplate}
          >
            下载模板
          </button>
          <button
            className="mnt-btn mnt-btn--primary"
            type="button"
            onClick={() => handleConfirm()}
            disabled={phase !== 'parsed' || hasErrors}
          >
            {phase === 'submitting' ? '上传中…' : '确认导入'}
          </button>
        </footer>
      </div>
    </div>
  );
}
