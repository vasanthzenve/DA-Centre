package com.veterinary.research.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veterinary.research.dto.*;
import com.veterinary.research.entity.SidebarField;
import com.veterinary.research.entity.SidebarFile;
import com.veterinary.research.entity.SidebarModule;
import com.veterinary.research.entity.SidebarRecord;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.repository.SidebarFieldRepository;
import com.veterinary.research.repository.SidebarFileRepository;
import com.veterinary.research.repository.SidebarModuleRepository;
import com.veterinary.research.repository.SidebarRecordRepository;
import com.veterinary.research.service.DynamicSidebarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.csv.DuplicateHeaderMode;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DynamicSidebarServiceImpl implements DynamicSidebarService {

    private final SidebarModuleRepository moduleRepository;
    private final SidebarFieldRepository fieldRepository;
    private final SidebarRecordRepository recordRepository;
    private final SidebarFileRepository fileRepository;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    private static final String TEMP_UPLOAD_DIR = "uploads/temp_sidebar";
    private static final String PERM_UPLOAD_DIR = "uploads/sidebar_modules";

    private static final Pattern INT_PATTERN = Pattern.compile("^-?\\d+$");
    private static final Pattern DECIMAL_PATTERN = Pattern.compile("^-?\\d+\\.\\d+$");
    private static final Pattern DATE_PATTERN = Pattern.compile("^\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}|\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{4}$");

    @Override
    public ExcelAnalysisDTO analyzeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please upload a valid Excel or CSV file.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null) originalName = "uploaded_file.xlsx";
        String lowerName = originalName.toLowerCase();

        boolean isCsv = lowerName.endsWith(".csv");
        boolean isExcel = lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls");

        if (!isCsv && !isExcel) {
            throw new IllegalArgumentException("Unsupported file format. Please upload .xlsx, .xls, or .csv files.");
        }

        String tempToken = UUID.randomUUID().toString();
        Path tempPath = saveTempFile(file, tempToken, originalName);

        try {
            if (isCsv) {
                return analyzeCsvFile(tempPath, originalName, file.getSize(), tempToken);
            } else {
                return analyzeExcelFile(tempPath, originalName, file.getSize(), tempToken);
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to analyze uploaded file {}: {}", originalName, e.getMessage(), e);
            throw new RuntimeException("Failed to analyze spreadsheet structure: " + e.getMessage(), e);
        }
    }

    private Path saveTempFile(MultipartFile file, String token, String originalName) {
        try {
            Path dir = Paths.get(TEMP_UPLOAD_DIR);
            Files.createDirectories(dir);
            String ext = "";
            int dotIdx = originalName.lastIndexOf('.');
            if (dotIdx > 0) ext = originalName.substring(dotIdx);
            Path target = dir.resolve(token + ext);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target;
        } catch (IOException e) {
            throw new RuntimeException("Failed to cache uploaded file temporarily: " + e.getMessage(), e);
        }
    }

    private ExcelAnalysisDTO analyzeExcelFile(Path path, String originalName, long fileSize, String token) throws Exception {
        List<ExcelAnalysisDTO.SheetAnalysisDTO> sheetList = new ArrayList<>();
        int totalRowsAllSheets = 0;
        int maxColumnsAllSheets = 0;

        try (Workbook workbook = WorkbookFactory.create(path.toFile())) {
            int numberOfSheets = workbook.getNumberOfSheets();
            if (numberOfSheets == 0) {
                throw new IllegalArgumentException("The uploaded Excel workbook contains no sheets.");
            }

            for (int s = 0; s < numberOfSheets; s++) {
                Sheet sheet = workbook.getSheetAt(s);
                if (sheet == null) continue;
                String sheetName = sheet.getSheetName();

                Row headerRow = null;
                int firstRowNum = sheet.getFirstRowNum();
                int lastRowNum = sheet.getLastRowNum();

                if (firstRowNum >= 0 && lastRowNum >= firstRowNum) {
                    for (int r = firstRowNum; r <= lastRowNum; r++) {
                        Row row = sheet.getRow(r);
                        if (row != null && hasAnyNonEmptyCell(row)) {
                            headerRow = row;
                            break;
                        }
                    }
                }

                if (headerRow == null) {
                    continue; // Skip empty sheet
                }

                int totalColumns = headerRow.getLastCellNum();
                if (totalColumns <= 0) {
                    continue;
                }
                List<String> rawHeaders = new ArrayList<>();
                Set<String> seenHeaders = new HashSet<>();
                List<String> duplicateHeaders = new ArrayList<>();
                List<String> emptyHeaders = new ArrayList<>();

                for (int c = 0; c < totalColumns; c++) {
                    Cell cell = headerRow.getCell(c);
                    String headerVal = getCellString(cell);
                    if (headerVal == null || headerVal.isBlank()) {
                        headerVal = "Column_" + (c + 1);
                        emptyHeaders.add(headerVal);
                    }
                    if (!seenHeaders.add(headerVal.toLowerCase())) {
                        duplicateHeaders.add(headerVal);
                    }
                    rawHeaders.add(headerVal);
                }

                List<List<String>> sampleRowValues = new ArrayList<>();
                int validRowCount = 0;
                List<Map<String, Object>> sampleRecords = new ArrayList<>();

                int dataStartRow = headerRow.getRowNum() + 1;
                for (int r = dataStartRow; r <= lastRowNum; r++) {
                    Row row = sheet.getRow(r);
                    if (row == null || !hasAnyNonEmptyCell(row)) continue;

                    validRowCount++;
                    Map<String, Object> recordMap = new LinkedHashMap<>();
                    List<String> rowVals = new ArrayList<>();

                    for (int c = 0; c < totalColumns; c++) {
                        Cell cell = row.getCell(c);
                        String val = getCellString(cell);
                        rowVals.add(val);
                        String fieldKey = toFieldSlug(rawHeaders.get(c), c);
                        recordMap.put(fieldKey, val != null ? val : "");
                    }

                    if (sampleRecords.size() < 10) {
                        sampleRecords.add(recordMap);
                    }
                    if (sampleRowValues.size() < 100) {
                        sampleRowValues.add(rowVals);
                    }
                }

                List<ExcelAnalysisDTO.FieldAnalysisDTO> fields = new ArrayList<>();
                for (int c = 0; c < totalColumns; c++) {
                    String label = rawHeaders.get(c);
                    String fieldName = toFieldSlug(label, c);

                    List<String> colValues = new ArrayList<>();
                    for (List<String> rowValList : sampleRowValues) {
                        if (c < rowValList.size() && rowValList.get(c) != null && !rowValList.get(c).isBlank()) {
                            colValues.add(rowValList.get(c));
                        }
                    }

                    String detectedType = inferDataType(colValues);
                    List<String> samples = colValues.size() > 5 ? colValues.subList(0, 5) : colValues;

                    fields.add(ExcelAnalysisDTO.FieldAnalysisDTO.builder()
                            .fieldName(fieldName)
                            .fieldLabel(label)
                            .dataType(detectedType)
                            .columnPosition(c)
                            .isRequired(false)
                            .sampleValues(samples)
                            .empty(emptyHeaders.contains(label))
                            .duplicate(duplicateHeaders.contains(label))
                            .build());
                }

                sheetList.add(ExcelAnalysisDTO.SheetAnalysisDTO.builder()
                        .sheetName(sheetName)
                        .totalRows(validRowCount)
                        .totalColumns(totalColumns)
                        .fields(fields)
                        .emptyColumns(emptyHeaders)
                        .duplicateColumns(duplicateHeaders)
                        .sampleRecords(sampleRecords)
                        .build());

                totalRowsAllSheets += validRowCount;
                maxColumnsAllSheets = Math.max(maxColumnsAllSheets, totalColumns);
            }
        }

        if (sheetList.isEmpty()) {
            throw new IllegalArgumentException("The uploaded Excel workbook contains no readable data or valid rows.");
        }

        return ExcelAnalysisDTO.builder()
                .fileName(originalName)
                .fileSize(fileSize)
                .fileType("EXCEL")
                .tempToken(token)
                .totalSheets(sheetList.size())
                .totalRows(totalRowsAllSheets)
                .totalColumns(maxColumnsAllSheets)
                .sheets(sheetList)
                .build();
    }

    private ExcelAnalysisDTO analyzeCsvFile(Path path, String originalName, long fileSize, String token) throws Exception {
        List<CSVRecord> records;
        try (Reader reader = new InputStreamReader(Files.newInputStream(path), StandardCharsets.UTF_8)) {
            CSVParser parser = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setTrim(true)
                    .setIgnoreEmptyLines(true)
                    .setDuplicateHeaderMode(DuplicateHeaderMode.ALLOW_ALL)
                    .setAllowMissingColumnNames(true)
                    .build()
                    .parse(reader);
            List<String> headers = parser.getHeaderNames();
            if (headers == null || headers.isEmpty()) {
                throw new IllegalArgumentException("The uploaded CSV file is empty or contains no headers.");
            }
            records = parser.getRecords();

            int totalColumns = headers.size();
            List<String> rawHeaders = new ArrayList<>(headers);
            Set<String> seenHeaders = new HashSet<>();
            List<String> duplicateHeaders = new ArrayList<>();
            List<String> emptyHeaders = new ArrayList<>();

            for (int i = 0; i < totalColumns; i++) {
                String h = rawHeaders.get(i);
                if (h == null || h.isBlank()) {
                    h = "Column_" + (i + 1);
                    emptyHeaders.add(h);
                    rawHeaders.set(i, h);
                }
                if (!seenHeaders.add(h.toLowerCase())) {
                    duplicateHeaders.add(h);
                }
            }

            List<Map<String, Object>> sampleRecords = new ArrayList<>();
            List<List<String>> sampleRowValues = new ArrayList<>();

            for (CSVRecord rec : records) {
                Map<String, Object> map = new LinkedHashMap<>();
                List<String> rowVals = new ArrayList<>();
                for (int c = 0; c < totalColumns; c++) {
                    String val = c < rec.size() ? rec.get(c) : "";
                    rowVals.add(val);
                    String fieldKey = toFieldSlug(rawHeaders.get(c), c);
                    map.put(fieldKey, val);
                }
                if (sampleRecords.size() < 10) {
                    sampleRecords.add(map);
                }
                if (sampleRowValues.size() < 100) {
                    sampleRowValues.add(rowVals);
                }
            }

            List<ExcelAnalysisDTO.FieldAnalysisDTO> fields = new ArrayList<>();
            for (int c = 0; c < totalColumns; c++) {
                String label = rawHeaders.get(c);
                String fieldName = toFieldSlug(label, c);

                List<String> colValues = new ArrayList<>();
                for (List<String> r : sampleRowValues) {
                    if (c < r.size() && r.get(c) != null && !r.get(c).isBlank()) {
                        colValues.add(r.get(c));
                    }
                }

                String detectedType = inferDataType(colValues);
                List<String> samples = colValues.size() > 5 ? colValues.subList(0, 5) : colValues;

                fields.add(ExcelAnalysisDTO.FieldAnalysisDTO.builder()
                        .fieldName(fieldName)
                        .fieldLabel(label)
                        .dataType(detectedType)
                        .columnPosition(c)
                        .isRequired(false)
                        .sampleValues(samples)
                        .empty(emptyHeaders.contains(label))
                        .duplicate(duplicateHeaders.contains(label))
                        .build());
            }

            ExcelAnalysisDTO.SheetAnalysisDTO sheet = ExcelAnalysisDTO.SheetAnalysisDTO.builder()
                    .sheetName("Sheet1")
                    .totalRows(records.size())
                    .totalColumns(totalColumns)
                    .fields(fields)
                    .emptyColumns(emptyHeaders)
                    .duplicateColumns(duplicateHeaders)
                    .sampleRecords(sampleRecords)
                    .build();

            return ExcelAnalysisDTO.builder()
                    .fileName(originalName)
                    .fileSize(fileSize)
                    .fileType("CSV")
                    .tempToken(token)
                    .totalSheets(1)
                    .totalRows(records.size())
                    .totalColumns(totalColumns)
                    .sheets(List.of(sheet))
                    .build();
        }
    }

    private String inferDataType(List<String> values) {
        if (values == null || values.isEmpty()) return "String";
        boolean allInt = true;
        boolean allDecimal = true;
        boolean allDate = true;
        boolean allBoolean = true;
        int nonEmptyCount = 0;

        for (String val : values) {
            if (val == null) continue;
            String v = val.trim();
            if (v.isEmpty()) continue;
            nonEmptyCount++;

            if (allInt && !INT_PATTERN.matcher(v).matches()) allInt = false;
            if (allDecimal && !DECIMAL_PATTERN.matcher(v).matches() && !INT_PATTERN.matcher(v).matches()) allDecimal = false;
            if (allDate && !DATE_PATTERN.matcher(v).matches()) allDate = false;
            if (allBoolean && !v.equalsIgnoreCase("true") && !v.equalsIgnoreCase("false") && !v.equalsIgnoreCase("yes") && !v.equalsIgnoreCase("no")) {
                allBoolean = false;
            }
        }

        if (nonEmptyCount == 0) return "String";
        if (allInt) return "Integer";
        if (allDecimal) return "Decimal";
        if (allBoolean) return "Boolean";
        if (allDate) return "Date";
        return "String";
    }

    private String toFieldSlug(String label, int fallbackIndex) {
        if (label == null || label.isBlank()) {
            return "field_" + (fallbackIndex + 1);
        }
        String slug = label.trim().toLowerCase()
                .replaceAll("[^a-z0-9_]+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");
        if (slug.isEmpty() || Character.isDigit(slug.charAt(0))) {
            slug = "f_" + slug;
        }
        return slug;
    }

    private boolean hasAnyNonEmptyCell(Row row) {
        for (int i = row.getFirstCellNum(); i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String val = getCellString(cell);
                if (val != null && !val.isBlank()) return true;
            }
        }
        return false;
    }

    private String getCellString(Cell cell) {
        if (cell == null) return null;
        try {
            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue().trim();
                case NUMERIC -> {
                    if (DateUtil.isCellDateFormatted(cell)) {
                        LocalDate ld = cell.getLocalDateTimeCellValue().toLocalDate();
                        yield ld.toString();
                    }
                    double d = cell.getNumericCellValue();
                    if (d == Math.floor(d)) {
                        yield String.valueOf((long) d);
                    }
                    yield String.valueOf(d);
                }
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                case FORMULA -> {
                    try {
                        yield cell.getStringCellValue().trim();
                    } catch (Exception e) {
                        double d = cell.getNumericCellValue();
                        if (d == Math.floor(d)) {
                            yield String.valueOf((long) d);
                        }
                        yield String.valueOf(d);
                    }
                }
                default -> null;
            };
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    @Transactional
    public SidebarModuleDTO createModule(CreateModuleRequest request, MultipartFile directFile) {
        if (request.getSidebarName() == null || request.getSidebarName().isBlank()) {
            throw new IllegalArgumentException("Sidebar Name is required.");
        }

        String moduleSlug = generateUniqueSlug(request.getSidebarName(), request.getModuleSlug());

        Path sourceFilePath = null;
        String originalFileName = "data.xlsx";
        long fileSize = 0;

        if (directFile != null && !directFile.isEmpty()) {
            originalFileName = directFile.getOriginalFilename();
            fileSize = directFile.getSize();
            String tempToken = UUID.randomUUID().toString();
            sourceFilePath = saveTempFile(directFile, tempToken, originalFileName);
        } else if (request.getTempToken() != null && !request.getTempToken().isBlank()) {
            Path tempDir = Paths.get(TEMP_UPLOAD_DIR);
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(tempDir, request.getTempToken() + ".*")) {
                for (Path p : stream) {
                    sourceFilePath = p;
                    originalFileName = p.getFileName().toString();
                    fileSize = Files.size(p);
                    break;
                }
            } catch (IOException e) {
                log.warn("Error finding temp file: {}", e.getMessage());
            }
        }

        if (sourceFilePath == null || !Files.exists(sourceFilePath)) {
            throw new IllegalArgumentException("No uploaded file found. Please upload an Excel/CSV file first.");
        }

        Path permDir = Paths.get(PERM_UPLOAD_DIR);
        Path permFilePath;
        try {
            Files.createDirectories(permDir);
            String extension = "";
            int dot = originalFileName.lastIndexOf('.');
            if (dot >= 0) extension = originalFileName.substring(dot);
            permFilePath = permDir.resolve(moduleSlug + "_" + System.currentTimeMillis() + extension);
            Files.copy(sourceFilePath, permFilePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save permanent module file: " + e.getMessage(), e);
        }

        SidebarModule module = SidebarModule.builder()
                .sidebarName(request.getSidebarName().trim())
                .moduleSlug(moduleSlug)
                .description(request.getDescription())
                .uploadedFileName(originalFileName)
                .filePath(permFilePath.toString())
                .createdBy(request.getCreatedBy() != null ? request.getCreatedBy() : "Admin")
                .status("ACTIVE")
                .build();

        module = moduleRepository.save(module);

        SidebarFile sidebarFile = SidebarFile.builder()
                .moduleId(module.getId())
                .originalFileName(originalFileName)
                .storedFilePath(permFilePath.toString())
                .fileType(originalFileName.toLowerCase().endsWith(".csv") ? "CSV" : "EXCEL")
                .fileSize(fileSize)
                .build();
        fileRepository.save(sidebarFile);

        int totalSheets = 1;
        int totalRows = 0;
        int totalColumns = 0;

        try {
            if (originalFileName.toLowerCase().endsWith(".csv")) {
                totalRows = importCsvRecords(module.getId(), permFilePath, request.getCustomFields());
                totalColumns = request.getCustomFields() != null ? request.getCustomFields().size() : 0;
            } else {
                ImportResult result = importExcelRecords(module.getId(), permFilePath, request.getSelectedSheetName(), request.getCustomFields());
                totalSheets = result.totalSheets;
                totalRows = result.totalRows;
                totalColumns = result.totalColumns;
            }
        } catch (Exception e) {
            log.error("Error importing records for dynamic module {}: {}", moduleSlug, e.getMessage(), e);
            throw new RuntimeException("Failed to parse and store records: " + e.getMessage(), e);
        }

        module.setTotalSheets(totalSheets);
        module.setTotalRows(totalRows);
        module.setTotalColumns(totalColumns);
        module = moduleRepository.save(module);

        try {
            Files.deleteIfExists(sourceFilePath);
        } catch (Exception ignored) {}

        return getModuleById(module.getId());
    }

    private static class ImportResult {
        int totalSheets;
        int totalRows;
        int totalColumns;
    }

    private ImportResult importExcelRecords(Long moduleId, Path path, String targetSheetName, List<ExcelAnalysisDTO.FieldAnalysisDTO> customFields) throws Exception {
        ImportResult result = new ImportResult();
        try (Workbook workbook = WorkbookFactory.create(path.toFile())) {
            int sheetCount = workbook.getNumberOfSheets();
            result.totalSheets = sheetCount;

            Sheet sheet = null;
            if (targetSheetName != null && !targetSheetName.isBlank()) {
                sheet = workbook.getSheet(targetSheetName);
            }
            if (sheet == null) {
                sheet = workbook.getSheetAt(0);
            }

            String sheetName = sheet.getSheetName();
            Row headerRow = null;
            for (int r = sheet.getFirstRowNum(); r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row != null && hasAnyNonEmptyCell(row)) {
                    headerRow = row;
                    break;
                }
            }

            if (headerRow == null) {
                return result;
            }

            int numCols = headerRow.getLastCellNum();
            result.totalColumns = numCols;

            List<SidebarField> fieldsToSave = new ArrayList<>();
            Map<Integer, String> colToKeyMap = new HashMap<>();

            if (customFields != null && !customFields.isEmpty()) {
                for (int i = 0; i < customFields.size(); i++) {
                    ExcelAnalysisDTO.FieldAnalysisDTO cf = customFields.get(i);
                    String label = cf.getFieldLabel();
                    if ((label == null || label.isBlank()) && cf.getHeaderName() != null) {
                        label = cf.getHeaderName();
                    }
                    if (label == null || label.isBlank()) {
                        label = cf.getFieldName() != null && !cf.getFieldName().isBlank() ? cf.getFieldName() : ("Column_" + (i + 1));
                    }
                    String name = cf.getFieldName();
                    if (name == null || name.isBlank()) {
                        name = toFieldSlug(label, i);
                    }
                    int colPos = cf.getColumnPosition() != null ? cf.getColumnPosition() : i;
                    colToKeyMap.put(colPos, name);
                    fieldsToSave.add(SidebarField.builder()
                            .moduleId(moduleId)
                            .sheetName(sheetName)
                            .fieldName(name)
                            .fieldLabel(label)
                            .dataType(cf.getDataType() != null && !cf.getDataType().isBlank() ? cf.getDataType() : "String")
                            .columnPosition(colPos)
                            .isRequired(Boolean.TRUE.equals(cf.getIsRequired()))
                            .build());
                }
            } else {
                for (int c = 0; c < numCols; c++) {
                    Cell cell = headerRow.getCell(c);
                    String label = getCellString(cell);
                    if (label == null || label.isBlank()) label = "Column_" + (c + 1);
                    String fieldName = toFieldSlug(label, c);
                    colToKeyMap.put(c, fieldName);

                    fieldsToSave.add(SidebarField.builder()
                            .moduleId(moduleId)
                            .sheetName(sheetName)
                            .fieldName(fieldName)
                            .fieldLabel(label)
                            .dataType("String")
                            .columnPosition(c)
                            .isRequired(false)
                            .build());
                }
            }

            fieldRepository.saveAll(fieldsToSave);

            List<Object[]> batchArgs = new ArrayList<>();
            String sql = "INSERT INTO sidebar_records (module_id, sheet_name, `row_number`, row_data, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, NOW(), NOW())";

            int rowNumber = 1;
            int startRow = headerRow.getRowNum() + 1;
            int totalInserted = 0;

            for (int r = startRow; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null || !hasAnyNonEmptyCell(row)) continue;

                Map<String, Object> dataMap = new LinkedHashMap<>();
                for (Map.Entry<Integer, String> entry : colToKeyMap.entrySet()) {
                    int colIdx = entry.getKey();
                    String key = entry.getValue();
                    Cell cell = row.getCell(colIdx);
                    String val = getCellString(cell);
                    dataMap.put(key, val != null ? val : "");
                }

                String json = objectMapper.writeValueAsString(dataMap);
                batchArgs.add(new Object[]{moduleId, sheetName, rowNumber++, json});

                if (batchArgs.size() >= 500) {
                    jdbcTemplate.batchUpdate(sql, batchArgs);
                    totalInserted += batchArgs.size();
                    batchArgs.clear();
                }
            }

            if (!batchArgs.isEmpty()) {
                jdbcTemplate.batchUpdate(sql, batchArgs);
                totalInserted += batchArgs.size();
                batchArgs.clear();
            }

            result.totalRows = totalInserted;
            return result;
        }
    }

    private int importCsvRecords(Long moduleId, Path path, List<ExcelAnalysisDTO.FieldAnalysisDTO> customFields) throws Exception {
        try (Reader reader = new InputStreamReader(Files.newInputStream(path), StandardCharsets.UTF_8)) {
            CSVParser parser = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setTrim(true)
                    .setIgnoreEmptyLines(true)
                    .setDuplicateHeaderMode(DuplicateHeaderMode.ALLOW_ALL)
                    .setAllowMissingColumnNames(true)
                    .build()
                    .parse(reader);
            List<String> headers = parser.getHeaderNames();
            if (headers == null || headers.isEmpty()) {
                return 0;
            }
            int numCols = headers.size();

            List<SidebarField> fieldsToSave = new ArrayList<>();
            Map<Integer, String> colToKeyMap = new HashMap<>();

            if (customFields != null && !customFields.isEmpty()) {
                for (int i = 0; i < customFields.size(); i++) {
                    ExcelAnalysisDTO.FieldAnalysisDTO cf = customFields.get(i);
                    String label = cf.getFieldLabel();
                    if ((label == null || label.isBlank()) && cf.getHeaderName() != null) {
                        label = cf.getHeaderName();
                    }
                    if (label == null || label.isBlank()) {
                        label = cf.getFieldName() != null && !cf.getFieldName().isBlank() ? cf.getFieldName() : ("Column_" + (i + 1));
                    }
                    String name = cf.getFieldName();
                    if (name == null || name.isBlank()) {
                        name = toFieldSlug(label, i);
                    }
                    int colPos = cf.getColumnPosition() != null ? cf.getColumnPosition() : i;
                    colToKeyMap.put(colPos, name);
                    fieldsToSave.add(SidebarField.builder()
                            .moduleId(moduleId)
                            .sheetName("Sheet1")
                            .fieldName(name)
                            .fieldLabel(label)
                            .dataType(cf.getDataType() != null && !cf.getDataType().isBlank() ? cf.getDataType() : "String")
                            .columnPosition(colPos)
                            .isRequired(Boolean.TRUE.equals(cf.getIsRequired()))
                            .build());
                }
            } else {
                for (int c = 0; c < numCols; c++) {
                    String label = headers.get(c);
                    if (label == null || label.isBlank()) label = "Column_" + (c + 1);
                    String fieldName = toFieldSlug(label, c);
                    colToKeyMap.put(c, fieldName);

                    fieldsToSave.add(SidebarField.builder()
                            .moduleId(moduleId)
                            .sheetName("Sheet1")
                            .fieldName(fieldName)
                            .fieldLabel(label)
                            .dataType("String")
                            .columnPosition(c)
                            .isRequired(false)
                            .build());
                }
            }

            fieldRepository.saveAll(fieldsToSave);

            List<Object[]> batchArgs = new ArrayList<>();
            String sql = "INSERT INTO sidebar_records (module_id, sheet_name, `row_number`, row_data, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, NOW(), NOW())";

            int rowNumber = 1;
            int totalInserted = 0;

            for (CSVRecord rec : parser) {
                Map<String, Object> dataMap = new LinkedHashMap<>();
                for (Map.Entry<Integer, String> entry : colToKeyMap.entrySet()) {
                    int c = entry.getKey();
                    String key = entry.getValue();
                    String val = c < rec.size() ? rec.get(c) : "";
                    dataMap.put(key, val);
                }

                String json = objectMapper.writeValueAsString(dataMap);
                batchArgs.add(new Object[]{moduleId, "Sheet1", rowNumber++, json});

                if (batchArgs.size() >= 500) {
                    jdbcTemplate.batchUpdate(sql, batchArgs);
                    totalInserted += batchArgs.size();
                    batchArgs.clear();
                }
            }

            if (!batchArgs.isEmpty()) {
                jdbcTemplate.batchUpdate(sql, batchArgs);
                totalInserted += batchArgs.size();
                batchArgs.clear();
            }

            return totalInserted;
        }
    }

    private String generateUniqueSlug(String name, String preferredSlug) {
        String base = (preferredSlug != null && !preferredSlug.isBlank()) ? preferredSlug : name;
        String slug = base.trim().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        if (slug.isEmpty()) slug = "module-" + System.currentTimeMillis();

        String candidate = slug;
        int count = 1;
        while (moduleRepository.existsByModuleSlug(candidate)) {
            candidate = slug + "-" + count++;
        }
        return candidate;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SidebarModuleDTO> getAllActiveModules() {
        List<SidebarModule> modules = moduleRepository.findAllActive();
        List<SidebarModuleDTO> dtoList = new ArrayList<>();
        for (SidebarModule m : modules) {
            dtoList.add(mapModuleToDTO(m, false));
        }
        return dtoList;
    }

    @Override
    @Transactional(readOnly = true)
    public SidebarModuleDTO getModuleById(Long id) {
        SidebarModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SidebarModule", "id", id));
        return mapModuleToDTO(module, true);
    }

    @Override
    @Transactional(readOnly = true)
    public SidebarModuleDTO getModuleBySlug(String slug) {
        SidebarModule module = moduleRepository.findByModuleSlugAndStatus(slug, "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("SidebarModule", "moduleSlug", slug));
        return mapModuleToDTO(module, true);
    }

    private SidebarModuleDTO mapModuleToDTO(SidebarModule m, boolean includeFields) {
        List<String> sheets = fieldRepository.findDistinctSheetNamesByModuleId(m.getId());
        if (sheets.isEmpty()) sheets = List.of("Sheet1");

        List<SidebarFieldDTO> fieldDTOs = Collections.emptyList();
        if (includeFields) {
            List<SidebarField> fields = fieldRepository.findByModuleIdOrderByColumnPositionAsc(m.getId());
            fieldDTOs = fields.stream().map(f -> SidebarFieldDTO.builder()
                    .id(f.getId())
                    .moduleId(f.getModuleId())
                    .sheetName(f.getSheetName())
                    .fieldName(f.getFieldName())
                    .fieldLabel(f.getFieldLabel())
                    .dataType(f.getDataType())
                    .columnPosition(f.getColumnPosition())
                    .isRequired(f.getIsRequired())
                    .build()).toList();
        }

        return SidebarModuleDTO.builder()
                .id(m.getId())
                .sidebarName(m.getSidebarName())
                .moduleSlug(m.getModuleSlug())
                .description(m.getDescription())
                .uploadedFileName(m.getUploadedFileName())
                .filePath(m.getFilePath())
                .totalSheets(m.getTotalSheets())
                .totalRows(m.getTotalRows())
                .totalColumns(m.getTotalColumns())
                .createdBy(m.getCreatedBy())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .status(m.getStatus())
                .sheetNames(sheets)
                .fields(fieldDTOs)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SidebarFieldDTO> getModuleFields(Long id, String sheetName) {
        List<SidebarField> fields;
        if (sheetName != null && !sheetName.isBlank()) {
            fields = fieldRepository.findByModuleIdAndSheetNameOrderByColumnPositionAsc(id, sheetName);
        } else {
            fields = fieldRepository.findByModuleIdOrderByColumnPositionAsc(id);
        }

        return fields.stream().map(f -> SidebarFieldDTO.builder()
                .id(f.getId())
                .moduleId(f.getModuleId())
                .sheetName(f.getSheetName())
                .fieldName(f.getFieldName())
                .fieldLabel(f.getFieldLabel())
                .dataType(f.getDataType())
                .columnPosition(f.getColumnPosition())
                .isRequired(f.getIsRequired())
                .build()).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getModuleRecords(
            Long id,
            String sheetName,
            String search,
            int page,
            int size,
            String sortField,
            String sortDir,
            Map<String, String> filters
    ) {
        if (sheetName == null || sheetName.isBlank()) {
            List<String> sheets = fieldRepository.findDistinctSheetNamesByModuleId(id);
            sheetName = !sheets.isEmpty() ? sheets.get(0) : "Sheet1";
        }

        int pageSize = Math.max(1, Math.min(size, 200));
        Pageable pageable = PageRequest.of(page, pageSize);

        Page<SidebarRecord> recordPage = recordRepository.searchRecords(
                id,
                sheetName,
                search != null && !search.isBlank() ? search.trim() : null,
                pageable
        );

        List<Map<String, Object>> rowList = new ArrayList<>();
        TypeReference<Map<String, Object>> typeRef = new TypeReference<>() {};

        for (SidebarRecord sr : recordPage.getContent()) {
            try {
                Map<String, Object> map = objectMapper.readValue(sr.getRowData(), typeRef);
                map.put("id", sr.getId());
                map.put("_rowNumber", sr.getRowNumber());
                rowList.add(map);
            } catch (Exception e) {
                Map<String, Object> fallback = new HashMap<>();
                fallback.put("id", sr.getId());
                fallback.put("_rowNumber", sr.getRowNumber());
                fallback.put("raw", sr.getRowData());
                rowList.add(fallback);
            }
        }

        if (sortField != null && !sortField.isBlank()) {
            boolean asc = !"desc".equalsIgnoreCase(sortDir);
            rowList.sort((a, b) -> {
                Object v1 = a.get(sortField);
                Object v2 = b.get(sortField);
                if (v1 == null && v2 == null) return 0;
                if (v1 == null) return asc ? -1 : 1;
                if (v2 == null) return asc ? 1 : -1;
                int cmp = String.valueOf(v1).compareToIgnoreCase(String.valueOf(v2));
                return asc ? cmp : -cmp;
            });
        }

        return PageResponse.<Map<String, Object>>builder()
                .content(rowList)
                .pageNumber(recordPage.getNumber())
                .pageSize(recordPage.getSize())
                .totalElements(recordPage.getTotalElements())
                .totalPages(recordPage.getTotalPages())
                .first(recordPage.isFirst())
                .last(recordPage.isLast())
                .hasNext(recordPage.hasNext())
                .hasPrevious(recordPage.hasPrevious())
                .hasMore(recordPage.hasNext())
                .build();
    }

    @Override
    @Transactional
    public SidebarModuleDTO updateModule(Long id, UpdateModuleRequest request) {
        SidebarModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SidebarModule", "id", id));

        if (request.getSidebarName() != null && !request.getSidebarName().isBlank()) {
            module.setSidebarName(request.getSidebarName().trim());
        }
        if (request.getDescription() != null) {
            module.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            module.setStatus(request.getStatus().trim());
        }

        module = moduleRepository.save(module);
        return getModuleById(module.getId());
    }

    @Override
    @Transactional
    public void deleteModule(Long id) {
        SidebarModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SidebarModule", "id", id));

        // Delete file on disk
        if (module.getFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(module.getFilePath()));
            } catch (Exception ignored) {}
        }

        recordRepository.deleteByModuleId(id);
        fieldRepository.deleteByModuleId(id);
        fileRepository.deleteByModuleId(id);
        moduleRepository.delete(module);
        log.info("Deleted dynamic sidebar module id: {}", id);
    }

    @Override
    @Transactional
    public void deleteRecords(Long id, List<Long> recordIds) {
        SidebarModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SidebarModule", "id", id));

        if (recordIds == null || recordIds.isEmpty()) return;

        recordRepository.deleteByModuleIdAndIdIn(id, recordIds);
        long remaining = recordRepository.countByModuleId(id);
        module.setTotalRows((int) remaining);
        moduleRepository.save(module);
    }

    @Override
    @Transactional
    public SidebarModuleDTO replaceFile(Long id, MultipartFile file) {
        SidebarModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SidebarModule", "id", id));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please upload a valid replacement file.");
        }

        // Delete existing file from disk
        if (module.getFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(module.getFilePath()));
            } catch (Exception ignored) {}
        }

        recordRepository.deleteByModuleId(id);
        fieldRepository.deleteByModuleId(id);
        fileRepository.deleteByModuleId(id);

        String originalName = file.getOriginalFilename();
        if (originalName == null) originalName = "replacement.xlsx";

        Path permDir = Paths.get(PERM_UPLOAD_DIR);
        Path permFilePath;
        try {
            Files.createDirectories(permDir);
            String extension = "";
            int dot = originalName.lastIndexOf('.');
            if (dot >= 0) extension = originalName.substring(dot);
            permFilePath = permDir.resolve(module.getModuleSlug() + "_" + System.currentTimeMillis() + extension);
            Files.copy(file.getInputStream(), permFilePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save replacement file: " + e.getMessage(), e);
        }

        module.setUploadedFileName(originalName);
        module.setFilePath(permFilePath.toString());

        SidebarFile sidebarFile = SidebarFile.builder()
                .moduleId(module.getId())
                .originalFileName(originalName)
                .storedFilePath(permFilePath.toString())
                .fileType(originalName.toLowerCase().endsWith(".csv") ? "CSV" : "EXCEL")
                .fileSize(file.getSize())
                .build();
        fileRepository.save(sidebarFile);

        try {
            if (originalName.toLowerCase().endsWith(".csv")) {
                int totalRows = importCsvRecords(module.getId(), permFilePath, null);
                module.setTotalSheets(1);
                module.setTotalRows(totalRows);
                module.setTotalColumns(fieldRepository.findByModuleIdOrderByColumnPositionAsc(id).size());
            } else {
                ImportResult res = importExcelRecords(module.getId(), permFilePath, null, null);
                module.setTotalSheets(res.totalSheets);
                module.setTotalRows(res.totalRows);
                module.setTotalColumns(res.totalColumns);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze and import replacement file: " + e.getMessage(), e);
        }

        module = moduleRepository.save(module);
        return getModuleById(module.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportModuleToExcel(Long id, String sheetName) {
        if (!moduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("SidebarModule", "id", id);
        }

        List<SidebarField> fields = fieldRepository.findByModuleIdOrderByColumnPositionAsc(id);
        if (sheetName == null || sheetName.isBlank()) {
            sheetName = !fields.isEmpty() && fields.get(0).getSheetName() != null ? fields.get(0).getSheetName() : "Data";
        }

        List<SidebarRecord> records = recordRepository.findByModuleIdAndSheetNameOrderByRowNumberAsc(id, sheetName);

        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100);
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {

            SXSSFSheet sheet = workbook.createSheet(sheetName);

            // Header Font & Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.LEFT);

            // Create Header Row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < fields.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(fields.get(i).getFieldLabel());
                cell.setCellStyle(headerStyle);
            }

            TypeReference<Map<String, Object>> typeRef = new TypeReference<>() {};
            int rowIdx = 1;

            for (SidebarRecord sr : records) {
                Row dataRow = sheet.createRow(rowIdx++);
                Map<String, Object> dataMap;
                try {
                    dataMap = objectMapper.readValue(sr.getRowData(), typeRef);
                } catch (Exception e) {
                    dataMap = Collections.emptyMap();
                }

                for (int c = 0; c < fields.size(); c++) {
                    String key = fields.get(c).getFieldName();
                    Object val = dataMap.get(key);
                    Cell cell = dataRow.createCell(c);

                    if (val == null) {
                        cell.setBlank();
                    } else if (val instanceof Number n) {
                        cell.setCellValue(n.doubleValue());
                    } else if (val instanceof Boolean b) {
                        cell.setCellValue(b);
                    } else {
                        cell.setCellValue(String.valueOf(val));
                    }
                }
            }

            workbook.write(bos);
            return bos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to export dynamic module {} to Excel: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to export module data to Excel: " + e.getMessage(), e);
        }
    }
}

