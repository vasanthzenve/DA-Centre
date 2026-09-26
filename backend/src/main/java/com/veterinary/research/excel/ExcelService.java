package com.veterinary.research.excel;

import com.github.pjfanning.xlsx.StreamingReader;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.job.JobManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class ExcelService {

    private final JdbcTemplate jdbcTemplate;
    private final JobManager jobManager;

    @Value("${app.storage.temp-dir:./data/temp}")
    private String tempStorageDir;

    private static final int BATCH_SIZE = 2000;

    /**
     * Full-file Preview using StreamingReader — scans the ENTIRE sheet with no row limit.
     * Accurately counts all valid/invalid rows across the whole file.
     * Returns up to PREVIEW_SAMPLE_ROWS rows in the previewRows payload for UI display;
     * actual import must use the async streaming job (handles millions of rows).
     * Memory footprint: O(PREVIEW_SAMPLE_ROWS) regardless of file size.
     */
    private static final int PREVIEW_SAMPLE_ROWS = 500;

    public ExcelDTOs.ExcelPreviewResponse previewExcel(String module, MultipartFile file) throws Exception {
        List<ModuleMetadata.FieldDefinition> fieldDefs = ModuleMetadata.getFieldsForModule(module);
        if (fieldDefs.isEmpty()) {
            throw new IllegalArgumentException("Unknown module for Excel preview: " + module);
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = StreamingReader.builder()
                     .rowCacheSize(50)
                     .bufferSize(4096)
                     .open(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            String sheetName = sheet.getSheetName();

            Iterator<Row> rowIterator = sheet.iterator();
            if (!rowIterator.hasNext()) {
                throw new IllegalArgumentException("Excel sheet has no content.");
            }

            Row headerRow = rowIterator.next();
            Map<Integer, ModuleMetadata.FieldDefinition> columnMapping = new HashMap<>();
            List<String> detectedHeaders = new ArrayList<>();

            for (Cell cell : headerRow) {
                String headerText = ExcelHelper.getCellValueAsString(cell);
                if (headerText != null && !headerText.isBlank()) {
                    detectedHeaders.add(headerText);
                    String normalized = ExcelHelper.normalizeHeader(headerText);

                    for (ModuleMetadata.FieldDefinition def : fieldDefs) {
                        if (ExcelHelper.normalizeHeader(def.getBusinessName()).equals(normalized) ||
                            ExcelHelper.normalizeHeader(def.getEntityProperty()).equals(normalized)) {
                            columnMapping.put(cell.getColumnIndex(), def);
                            break;
                        }
                    }
                }
            }

            List<Map<String, Object>> previewRows = new ArrayList<>();
            List<ExcelDTOs.InvalidRowInfo> invalidRows = new ArrayList<>();
            int totalScanned = 0;
            int validCount = 0;

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                totalScanned++;

                boolean isBlank = true;
                Map<String, Object> rowMap = new LinkedHashMap<>();
                List<String> rowErrors = new ArrayList<>();

                for (Map.Entry<Integer, ModuleMetadata.FieldDefinition> entry : columnMapping.entrySet()) {
                    int colIdx = entry.getKey();
                    ModuleMetadata.FieldDefinition fieldDef = entry.getValue();

                    Cell cell = row.getCell(colIdx);
                    String rawVal = ExcelHelper.getCellValueAsString(cell);

                    if (rawVal != null && !rawVal.isBlank()) {
                        isBlank = false;
                    }

                    if (fieldDef.isRequired() && (rawVal == null || rawVal.isBlank())) {
                        rowErrors.add(fieldDef.getBusinessName() + " is required");
                    } else if (rawVal != null && !rawVal.isBlank()) {
                        try {
                            switch (fieldDef.getType()) {
                                case DECIMAL -> rowMap.put(fieldDef.getBusinessName(), ExcelHelper.parseBigDecimal(rawVal));
                                case INTEGER -> rowMap.put(fieldDef.getBusinessName(), ExcelHelper.parseInteger(rawVal));
                                case DATE -> {
                                    LocalDate ld = ExcelHelper.parseLocalDate(rawVal);
                                    if (ld == null) {
                                        rowErrors.add(fieldDef.getBusinessName() + " has invalid date: " + rawVal);
                                    } else {
                                        rowMap.put(fieldDef.getBusinessName(), ld.toString());
                                    }
                                }
                                case STRING -> rowMap.put(fieldDef.getBusinessName(), rawVal);
                            }
                        } catch (Exception ex) {
                            rowErrors.add(fieldDef.getBusinessName() + " error: " + rawVal);
                        }
                    }
                }

                if (isBlank) continue;

                if ("market_research".equals(ModuleMetadata.normalizeModule(module))) {
                    Object tech = rowMap.get("Technology");
                    if (tech == null) tech = rowMap.get("technology");
                    Object prod = rowMap.get("Product");
                    if (prod == null) prod = rowMap.get("product");
                    Object price = rowMap.get("Price");
                    if (price == null) price = rowMap.get("price");
                    if ((tech == null || tech.toString().isBlank()) && prod != null && price != null) {
                        String pStr = price.toString();
                        if (!pStr.contains("₹") && !pStr.contains("?") && !pStr.matches(".*\\d.*") &&
                            !pStr.equalsIgnoreCase("Not publicly disclosed") && !pStr.equalsIgnoreCase("N/A")) {
                            rowMap.put("Technology", prod);
                            rowMap.put("Product", price);
                            rowMap.put("Price", "Not publicly disclosed");
                        }
                    }
                }

                if (rowErrors.isEmpty()) {
                    validCount++;
                    // Collect up to PREVIEW_SAMPLE_ROWS rows for UI display
                    if (previewRows.size() < PREVIEW_SAMPLE_ROWS) {
                        previewRows.add(rowMap);
                    }
                } else {
                    if (invalidRows.size() < PREVIEW_SAMPLE_ROWS) {
                        invalidRows.add(ExcelDTOs.InvalidRowInfo.builder()
                                .rowNumber(totalScanned + 1)
                                .errors(rowErrors)
                                .rowData(rowMap)
                                .build());
                    }
                }
            }

            return ExcelDTOs.ExcelPreviewResponse.builder()
                    .sheetName(sheetName)
                    .totalRows(totalScanned)
                    .validCount(validCount)
                    .invalidCount(invalidRows.size())
                    .detectedHeaders(detectedHeaders)
                    .previewRows(previewRows)
                    .invalidRows(invalidRows)
                    .build();
        }
    }

    /**
     * Asynchronously starts a streaming import background task.
     * Returns a JobInfo with unique jobId for live progress polling.
     */
    public JobInfo startAsyncImport(String module, MultipartFile file) throws IOException {
        Path tempDir = Paths.get(tempStorageDir);
        Files.createDirectories(tempDir);

        JobInfo job = jobManager.createJob(module, JobInfo.JobType.IMPORT, "xlsx");
        Path stagedFile = tempDir.resolve("import_" + job.getJobId() + ".xlsx");
        Files.copy(file.getInputStream(), stagedFile, StandardCopyOption.REPLACE_EXISTING);

        // Dispatch background worker
        processStreamingImportAsync(job.getJobId(), module, stagedFile.toAbsolutePath().toString());
        return job;
    }

    @Async("taskExecutor")
    public void processStreamingImportAsync(String jobId, String module, String stagedFilePath) {
        log.info("Starting async streaming import for job [{}] module [{}]", jobId, module);
        File file = new File(stagedFilePath);
        long processed = 0;
        long success = 0;
        long failed = 0;

        List<ModuleMetadata.FieldDefinition> fieldDefs = ModuleMetadata.getFieldsForModule(module);
        String tableName = getTableName(module);

        try (InputStream is = new FileInputStream(file);
             Workbook workbook = StreamingReader.builder()
                     .rowCacheSize(100)
                     .bufferSize(8192)
                     .open(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();
            if (!rowIterator.hasNext()) {
                jobManager.failJob(jobId, "Excel sheet is empty", null);
                return;
            }

            Row headerRow = rowIterator.next();
            Map<Integer, ModuleMetadata.FieldDefinition> columnMapping = new HashMap<>();

            for (Cell cell : headerRow) {
                String headerText = ExcelHelper.getCellValueAsString(cell);
                if (headerText != null && !headerText.isBlank()) {
                    String normalized = ExcelHelper.normalizeHeader(headerText);
                    for (ModuleMetadata.FieldDefinition def : fieldDefs) {
                        if (ExcelHelper.normalizeHeader(def.getBusinessName()).equals(normalized) ||
                            ExcelHelper.normalizeHeader(def.getEntityProperty()).equals(normalized)) {
                            columnMapping.put(cell.getColumnIndex(), def);
                            break;
                        }
                    }
                }
            }

            List<Map<String, Object>> batch = new ArrayList<>(BATCH_SIZE);

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                processed++;

                boolean isBlank = true;
                Map<String, Object> rowMap = new HashMap<>();

                for (Map.Entry<Integer, ModuleMetadata.FieldDefinition> entry : columnMapping.entrySet()) {
                    Cell cell = row.getCell(entry.getKey());
                    String raw = ExcelHelper.getCellValueAsString(cell);
                    if (raw != null && !raw.isBlank()) {
                        isBlank = false;
                        rowMap.put(entry.getValue().getEntityProperty(), raw.trim());
                    }
                }

                if (isBlank) continue;

                if ("market_research".equals(tableName)) {
                    Object tech = rowMap.get("technology");
                    Object prod = rowMap.get("product");
                    Object price = rowMap.get("price");
                    if ((tech == null || tech.toString().isBlank()) && prod != null && price != null) {
                        String pStr = price.toString();
                        if (!pStr.contains("₹") && !pStr.contains("?") && !pStr.matches(".*\\d.*") &&
                            !pStr.equalsIgnoreCase("Not publicly disclosed") && !pStr.equalsIgnoreCase("N/A")) {
                            rowMap.put("technology", prod);
                            rowMap.put("product", price);
                            rowMap.put("price", "Not publicly disclosed");
                        }
                    }
                }

                batch.add(rowMap);

                if (batch.size() >= BATCH_SIZE) {
                    int inserted = insertBatch(tableName, fieldDefs, batch);
                    success += inserted;
                    failed += (batch.size() - inserted);
                    batch.clear();
                    jobManager.updateProgress(jobId, processed, processed + 100, "Imported " + success + " records...");
                }
            }

            if (!batch.isEmpty()) {
                int inserted = insertBatch(tableName, fieldDefs, batch);
                success += inserted;
                failed += (batch.size() - inserted);
                batch.clear();
            }

            jobManager.completeJob(jobId, processed, success, failed, file.getName(), stagedFilePath, null);
            log.info("Finished streaming import for job [{}]: {} succeeded, {} failed", jobId, success, failed);

        } catch (Exception e) {
            log.error("Streaming import failed for job [{}]", jobId, e);
            jobManager.failJob(jobId, "Import failed: " + e.getMessage(), e);
        } finally {
            try {
                Files.deleteIfExists(file.toPath());
            } catch (Exception ignored) {}
        }
    }

    /**
     * High-speed batch insert using JdbcTemplate with rewriteBatchedStatements=true
     */
    private int insertBatch(String tableName, List<ModuleMetadata.FieldDefinition> fields, List<Map<String, Object>> rows) {
        if (rows.isEmpty()) return 0;

        // Build SQL using StringJoiner to avoid trailing comma syntax errors
        java.util.StringJoiner colJoiner = new java.util.StringJoiner(", ");
        java.util.StringJoiner phJoiner  = new java.util.StringJoiner(", ");
        for (ModuleMetadata.FieldDefinition f : fields) {
            colJoiner.add(camelToSnake(f.getEntityProperty()));
            phJoiner.add("?");
        }
        colJoiner.add("created_at");
        colJoiner.add("updated_at");
        phJoiner.add("?");
        phJoiner.add("?");

        String sql = "INSERT IGNORE INTO " + tableName + " (" + colJoiner + ") VALUES (" + phJoiner + ")";
        LocalDateTime now = LocalDateTime.now();

        List<Object[]> batchArgs = new ArrayList<>(rows.size());
        for (Map<String, Object> row : rows) {
            Object[] args = new Object[fields.size() + 2];
            for (int i = 0; i < fields.size(); i++) {
                ModuleMetadata.FieldDefinition def = fields.get(i);
                Object val = row.get(def.getEntityProperty());
                if (val == null) val = row.get(def.getBusinessName());

                if (val != null) {
                    switch (def.getType()) {
                        case DECIMAL -> {
                            try { args[i] = ExcelHelper.parseBigDecimal(val); } catch (Exception e) { args[i] = null; }
                        }
                        case INTEGER -> {
                            try { args[i] = ExcelHelper.parseInteger(val); } catch (Exception e) { args[i] = null; }
                        }
                        case DATE -> {
                            try { args[i] = ExcelHelper.parseLocalDate(val); } catch (Exception e) { args[i] = null; }
                        }
                        default -> {
                            // Truncate strings to maxLength to prevent "Data too long" DB errors
                            String strVal = val.toString();
                            int maxLen = def.getMaxLength();
                            args[i] = (maxLen > 0 && strVal.length() > maxLen)
                                    ? strVal.substring(0, maxLen)
                                    : strVal;
                        }
                    }
                } else {
                    args[i] = null;
                }
            }
            args[fields.size()] = now;
            args[fields.size() + 1] = now;
            batchArgs.add(args);
        }

        try {
            int[] results = jdbcTemplate.batchUpdate(sql, batchArgs);
            return results.length;
        } catch (Exception batchEx) {
            log.warn("Batch insert failed for table {} (batch size {}): {}. Falling back to row-by-row inserts.",
                    tableName, rows.size(), batchEx.getMessage());
            // Row-by-row fallback: inserts each row individually so good rows still succeed
            int saved = 0;
            for (Object[] args : batchArgs) {
                try {
                    jdbcTemplate.update(sql, args);
                    saved++;
                } catch (Exception rowEx) {
                    log.debug("Row insert skipped in {}: {}", tableName, rowEx.getMessage());
                }
            }
            log.info("Row-by-row fallback complete for {}: {}/{} rows saved", tableName, saved, rows.size());
            return saved;
        }
    }

    /**
     * Asynchronously starts a streaming background export (supports CSV for 15M records, or SXSSF for Excel).
     */
    public JobInfo startAsyncExport(String module, String format, Function<Long, List<Map<String, Object>>> chunkSupplier, long estimatedTotal) throws IOException {
        Path tempDir = Paths.get(tempStorageDir);
        Files.createDirectories(tempDir);

        String ext = "csv".equalsIgnoreCase(format) ? "csv" : "xlsx";
        JobInfo job = jobManager.createJob(module, JobInfo.JobType.EXPORT, ext);

        String fileName = ModuleMetadata.getExportFilename(module).replace(".xlsx", "." + ext);
        Path outputFile = tempDir.resolve("export_" + job.getJobId() + "." + ext);

        processStreamingExportAsync(job.getJobId(), module, ext, fileName, outputFile.toAbsolutePath().toString(), chunkSupplier, estimatedTotal);
        return job;
    }

    @Async("taskExecutor")
    public void processStreamingExportAsync(String jobId, String module, String format, String fileName, String outputPath,
                                           Function<Long, List<Map<String, Object>>> chunkSupplier, long estimatedTotal) {
        log.info("Starting async export for job [{}] in format [{}]", jobId, format);
        List<ModuleMetadata.FieldDefinition> fieldDefs = ModuleMetadata.getFieldsForModule(module);
        long processed = 0;
        Long lastId = 0L;

        try {
            File outFile = new File(outputPath);

            if ("csv".equalsIgnoreCase(format)) {
                // Ultra-fast streaming CSV
                try (BufferedWriter writer = Files.newBufferedWriter(outFile.toPath(), StandardCharsets.UTF_8);
                     CSVPrinter printer = ExcelHelper.createCsvPrinter(writer)) {

                    ExcelHelper.writeCsvHeader(printer, fieldDefs);

                    boolean hasMore = true;
                    while (hasMore) {
                        List<Map<String, Object>> chunk = chunkSupplier.apply(lastId);
                        if (chunk == null || chunk.isEmpty()) {
                            break;
                        }

                        for (Map<String, Object> row : chunk) {
                            ExcelHelper.writeCsvRow(printer, fieldDefs, row);
                            processed++;
                            if (row.get("id") instanceof Number) {
                                lastId = ((Number) row.get("id")).longValue();
                            }
                        }

                        printer.flush();
                        jobManager.updateProgress(jobId, processed, estimatedTotal > 0 ? estimatedTotal : processed + 1000, "Exported " + processed + " records...");

                        if (chunk.size() < 5000) {
                            hasMore = false;
                        }
                    }
                }
            } else {
                // SXSSF streaming workbook (sliding window 200 rows)
                try (OutputStream os = new FileOutputStream(outFile);
                     com.veterinary.research.excel.StreamingWorkbookWriter writer = new com.veterinary.research.excel.StreamingWorkbookWriter(os, module, fieldDefs)) {

                    boolean hasMore = true;
                    while (hasMore) {
                        List<Map<String, Object>> chunk = chunkSupplier.apply(lastId);
                        if (chunk == null || chunk.isEmpty()) {
                            break;
                        }

                        for (Map<String, Object> row : chunk) {
                            writer.writeRow(row);
                            processed++;
                            if (row.get("id") instanceof Number) {
                                lastId = ((Number) row.get("id")).longValue();
                            }
                        }

                        jobManager.updateProgress(jobId, processed, estimatedTotal > 0 ? estimatedTotal : processed + 1000, "Exported " + processed + " records...");

                        if (chunk.size() < 5000) {
                            hasMore = false;
                        }
                    }
                }
            }

            String downloadUrl = "/api/jobs/" + jobId + "/download";
            jobManager.completeJob(jobId, processed, processed, 0, fileName, outputPath, downloadUrl);
            log.info("Completed export job [{}] with {} records", jobId, processed);

        } catch (Exception e) {
            log.error("Async export failed for job [{}]", jobId, e);
            jobManager.failJob(jobId, "Export failed: " + e.getMessage(), e);
        }
    }

    public byte[] exportToExcel(String module, List<Map<String, Object>> dataRows) throws Exception {
        List<ModuleMetadata.FieldDefinition> fieldDefs = ModuleMetadata.getFieldsForModule(module);
        String sheetName = ModuleMetadata.getExportFilename(module).replace(".xlsx", "");
        return ExcelHelper.createStyledWorkbook(sheetName, fieldDefs, dataRows);
    }

    private static String getTableName(String module) {
        String norm = ModuleMetadata.normalizeModule(module);
        return switch (norm) {
            case "market_research" -> "market_research";
            case "veterinary_ecosystem" -> "veterinary_ecosystem";
            case "hygiene_products" -> "hygiene_products";
            case "food_products" -> "food_products";
            case "accessories" -> "accessories";
            case "service_network" -> "service_network";
            case "doctors" -> "doctors";
            case "welfare_network" -> "welfare_network";
            default -> norm;
        };
    }

    private static String camelToSnake(String str) {
        if (str == null) return "";
        return str.replaceAll("([a-z])([A-Z]+)", "$1_$2").toLowerCase();
    }
}
