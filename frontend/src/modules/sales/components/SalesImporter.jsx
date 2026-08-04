/**
 * CSV import modal: file pick, validation, POST importer, and per-row result summary.
 */
import { useMemo, useState } from 'react';
import { Box, Button, InputFile, Modal } from '../../../components';
import { CloudUpload, Download, FileSpreadsheet } from '../../../icons';
import { showToast } from '../../../utils';
import {
  downloadExampleSalesCsv,
  formatFilePreviewLabel,
  MAX_IMPORT_MB,
  parseCsvText,
  SALES_CSV_REQUIRED_COLUMNS,
  validateSalesCsv,
} from '../functions';
import { countImportSummary, extractImportResultRows, resolveImportClientMessage } from '../functions/importResults';
import { buildSalesImportPayload, importSalesCsv } from '../service/importer';
import styles from './SalesImporter.module.css';

export const SalesImporter = ({ open, setOpen, onImported }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const canImport = Boolean(file) && !loading;
  const summary = useMemo(
    () => (results ? countImportSummary(results) : null),
    [results],
  );
  const errorRows = useMemo(
    () => (results ? results.filter((item) => item?.status === 'ERROR') : []),
    [results],
  );

  const resetState = () => {
    setFile(null);
    setResults(null);
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    setOpen(false);
  };

  const previewLabel = useMemo(() => formatFilePreviewLabel(file), [file]);

  const handleDownloadExample = () => {
    downloadExampleSalesCsv();
    showToast('success', 'CSV de ejemplo descargado');
  };

  const handleImport = async () => {
    if (!file) {
      showToast('error', 'Seleccioná un archivo para importar');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const { headers, rows } = parseCsvText(text);
      const validation = validateSalesCsv(headers, rows);

      if (!validation.ok) {
        showToast('error', validation.message || 'El archivo CSV no es válido');
        return;
      }

      const payload = buildSalesImportPayload({
        headers,
        rows,
        fileName: file.name,
        dryRun: false,
      });

      const response = await importSalesCsv(payload, { showErrorAlert: false });
      if (!response?.success) {
        showToast(
          'error',
          response?.message ||
            response?.error ||
            'Ocurrió un error. Intentá nuevamente más tarde.',
        );
        return;
      }

      const resultRows = extractImportResultRows(response);
      setResults(resultRows);

      const stats = countImportSummary(resultRows);
      const clientMessage = resolveImportClientMessage(response, stats);

      if (stats.created > 0) {
        onImported?.({ file, headers, rows, results: resultRows, summary: stats });
      }

      if (stats.errors === 0) {
        showToast('success', clientMessage);
      } else if (stats.created > 0) {
        showToast('warning', clientMessage);
      } else {
        showToast('error', clientMessage);
      }
    } catch {
      showToast('error', 'Ocurrió un error. Intentá nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const footer = results ? (
    <Box className={styles.footer}>
      <Button type="button" variant="secondary" onClick={resetState}>
        Importar otro archivo
      </Button>
      <Button type="button" variant="primary" onClick={handleClose}>
        Cerrar
      </Button>
    </Box>
  ) : (
    <Box className={styles.footer}>
      <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
        Cancelar
      </Button>
      <Button type="button" variant="primary" onClick={handleImport} disabled={!canImport}>
        <CloudUpload width={16} height={16} />
        {loading ? 'Importando…' : 'Importar'}
      </Button>
    </Box>
  );

  return (
    <Modal
      open={open}
      setOpen={(next) => {
        if (!next) handleClose();
        else setOpen(true);
      }}
      title="Importar ventas por CSV"
      subtitle={
        results
          ? 'Resultado de la importación'
          : `Formato .csv o .xlsx · hasta ${MAX_IMPORT_MB} MB`
      }
      icon={<FileSpreadsheet width={20} height={20} />}
      bottom={footer}
      contentClassName="pb-2"
      className={results ? styles.resultsModal : ''}
    >
      {results ? (
        <Box className={styles.resultsPanel}>
          <Box className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total filas</span>
              <strong className={styles.statValue}>{summary?.total ?? 0}</strong>
            </div>
            <div className={`${styles.statCard} ${styles.statOk}`}>
              <span className={styles.statLabel}>Importadas</span>
              <strong className={styles.statValue}>{summary?.created ?? 0}</strong>
            </div>
            <div className={`${styles.statCard} ${styles.statError}`}>
              <span className={styles.statLabel}>Con error</span>
              <strong className={styles.statValue}>{summary?.errors ?? 0}</strong>
            </div>
          </Box>

          {errorRows.length > 0 ? (
            <Box className={styles.errorsBlock}>
              <h3 className={styles.errorsTitle}>Filas con error</h3>
              <p className={styles.errorsHint}>Solo lectura · no se pueden editar</p>
              <ul className={styles.errorsList}>
                {errorRows.map((item) => (
                  <li key={`error-row-${item.rowIndex}`} className={styles.errorItem}>
                    <div className={styles.errorHeader}>
                      <strong>Fila {item.rowIndex}</strong>
                      {item.row?.id_venta ? (
                        <span className={styles.errorCode}>{String(item.row.id_venta)}</span>
                      ) : null}
                    </div>
                    <ul className={styles.errorMessages}>
                      {(item.errors || ['Error desconocido']).map((message) => (
                        <li key={`${item.rowIndex}-${message}`}>{message}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </Box>
          ) : (
            <p className={styles.allOk}>Todas las filas se importaron correctamente.</p>
          )}
        </Box>
      ) : (
        <>
          <Box className={styles.exampleRow}>
            <p className={styles.exampleHint}>
              Columnas: {SALES_CSV_REQUIRED_COLUMNS.join(', ')}
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={handleDownloadExample}
              disabled={loading}
            >
              <Download width={14} height={14} />
              Descargar CSV de ejemplo
            </Button>
          </Box>
          <InputFile
            value={file}
            onChange={setFile}
            maxSizeMb={MAX_IMPORT_MB}
            disabled={loading}
          />
          {previewLabel ? (
            <p className={styles.previewMeta}>Seleccionado: {previewLabel}</p>
          ) : null}
        </>
      )}
    </Modal>
  );
};
