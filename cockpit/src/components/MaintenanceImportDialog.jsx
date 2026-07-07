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
  downloadTemplate,
} from '../lib/excelImport.js';
import './MaintenanceImportDialog.css';

const PREVIEW_ROWS = 8;

function statusBadge(ok, text) {
  return <span className={`mnt-import-badge${ok ? ' mnt-import-badge--ok' : ' mnt-import-badge--err'}`}>{text}</span>;
}

export default function MaintenanceImportDialog({ config, onClose, onImported }) {
  const fileInputRef = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle | parsed | submitting | done
  const [fileName, setFileName] = useState('');
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);

  const mapResult = useMemo(
    () => (rawHeaders.length && config ? mapAndValidate(rawHeaders, rawRows, config) : null),
    [rawHeaders, rawRows, config],
  );

  const hasErrors = mapResult?.errors?.length > 0;
  const previewRows = mapResult?.rows?.slice(0, PREVIEW_ROWS) ?? [];

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
      const initial = (config?.sheetName && names.includes(config.sheetName)) ? config.sheetName : names[0];
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
  }

  function handleSheetChange(event) {
    const name = event.target.value;
    setSheetName(name);
    if (workbook) loadSheet(workbook, name);
  }

  async function handleConfirm() {
    if (!config || hasErrors) return;
    setPhase('submitting');
    setSubmitError('');
    try {
      const resp = await fetch('/api/maintenance/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey: config.pageKey,
          meta: { sheetName },
          rawHeaders,
          rawRows,
          rows: mapResult.rows,
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
      if (data.accepted > 0) onImported?.();
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
    <div className="mnt-import-overlay" role="dialog" aria-label={config?.label || 'Excel 导入'}>
      <div className="mnt-import-mask" onClick={onClose} />
      <div className="mnt-import-card">
        <header className="mnt-import-head">
          <div>
            <h3>{config?.label || 'Excel 导入'}</h3>
            {config?.notes && <p className="mnt-import-notes">{config.notes}</p>}
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
                onClick={(e) => { e.stopPropagation(); if (config) downloadTemplate(config); }}
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
                    <select className="mnt-control" value={sheetName} onChange={handleSheetChange}>
                      {sheetNames.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
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
                    {config.columns.map((col) => {
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
                        <tr>{config.columns.map((c) => <th key={c.field}>{c.header}</th>)}</tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i}>
                            {config.columns.map((c) => <td key={c.field}>{row[c.field] ?? '—'}</td>)}
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
              <h4>导入结果（空跑）</h4>
              <p className="mnt-import-summary">
                {statusBadge(result.dryRun, '空跑未写库')} ·
                接收 {result.accepted} 行，拒绝 {result.rejected} 行，共 {result.totalRows} 行
              </p>
              <p className="mnt-import-hint">{result.summary}</p>
              {result.errors?.length > 0 && (
                <ul className="mnt-import-errors">
                  {result.errors.slice(0, 20).map((e, i) => (
                    <li key={i}>第 {e.row} 行 · {e.field}：{e.message}</li>
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
            onClick={() => config && downloadTemplate(config)}
          >
            下载模板
          </button>
          <button
            className="mnt-btn mnt-btn--primary"
            type="button"
            onClick={handleConfirm}
            disabled={phase !== 'parsed' || hasErrors}
          >
            {phase === 'submitting' ? '上传中…' : '确认导入'}
          </button>
        </footer>
      </div>
    </div>
  );
}
