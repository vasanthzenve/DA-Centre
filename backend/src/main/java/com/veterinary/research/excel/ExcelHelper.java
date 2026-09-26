package com.veterinary.research.excel;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

public class ExcelHelper {

    private static final DateTimeFormatter[] DATE_FORMATTERS = new DateTimeFormatter[]{
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd")
    };

    public static String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    LocalDate ld = cell.getLocalDateTimeCellValue().toLocalDate();
                    yield ld.toString();
                }
                double numericValue = cell.getNumericCellValue();
                if (numericValue == Math.floor(numericValue)) {
                    yield String.valueOf((long) numericValue);
                }
                yield String.valueOf(numericValue);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield cell.getStringCellValue().trim();
                } catch (Exception e) {
                    yield String.valueOf(cell.getNumericCellValue());
                }
            }
            default -> null;
        };
    }

    public static BigDecimal parseBigDecimal(Object value) throws NumberFormatException {
        if (value == null) return null;
        String raw = value.toString().trim();
        if (raw.isEmpty()) return null;
        // Extract the first decimal number only (e.g. "4.5 (123 reviews)" → "4.5")
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("-?\\d+(\\.\\d+)?").matcher(raw);
        if (!m.find()) return null;
        return new BigDecimal(m.group());
    }

    public static Integer parseInteger(Object value) throws NumberFormatException {
        if (value == null) return null;
        String raw = value.toString().trim();
        if (raw.isEmpty()) return null;
        // Extract the first integer token only
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("-?\\d+").matcher(raw);
        if (!m.find()) return null;
        String digits = m.group();
        // Guard against values that exceed Integer range
        try {
            return Integer.parseInt(digits);
        } catch (NumberFormatException e) {
            long lng = Long.parseLong(digits);
            return (int) Math.min(lng, Integer.MAX_VALUE);
        }
    }

    public static LocalDate parseLocalDate(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDate) return (LocalDate) value;
        String str = value.toString().trim();
        if (str.isEmpty()) return null;
        for (DateTimeFormatter dtf : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(str, dtf);
            } catch (DateTimeParseException ignored) {
            }
        }
        return null;
    }

    public static String normalizeHeader(String header) {
        if (header == null) return "";
        return header.toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    /**
     * High-performance SXSSF streaming Excel builder (retains only 200 rows in memory, flushes to temp disk)
     */
    public static byte[] createStyledWorkbook(String sheetName, List<ModuleMetadata.FieldDefinition> fields, List<Map<String, Object>> dataRows) throws IOException {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(200); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.setCompressTempFiles(true);
            SXSSFSheet sheet = workbook.createSheet(sheetName);

            // Styling Header Row
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 11);

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.LEFT);
            headerCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerCellStyle.setBorderBottom(BorderStyle.THIN);
            headerCellStyle.setBorderTop(BorderStyle.THIN);
            headerCellStyle.setBorderRight(BorderStyle.THIN);
            headerCellStyle.setBorderLeft(BorderStyle.THIN);

            // Data Row Styling
            CellStyle dataCellStyle = workbook.createCellStyle();
            dataCellStyle.setBorderBottom(BorderStyle.HAIR);
            dataCellStyle.setBorderTop(BorderStyle.HAIR);
            dataCellStyle.setBorderRight(BorderStyle.HAIR);
            dataCellStyle.setBorderLeft(BorderStyle.HAIR);
            dataCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // Create Header Row
            Row headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(24);
            for (int col = 0; col < fields.size(); col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(fields.get(col).getBusinessName());
                cell.setCellStyle(headerCellStyle);
            }

            // Populate Data Rows
            int rowIndex = 1;
            for (Map<String, Object> rowMap : dataRows) {
                Row row = sheet.createRow(rowIndex++);
                row.setHeightInPoints(20);

                for (int col = 0; col < fields.size(); col++) {
                    ModuleMetadata.FieldDefinition fieldDef = fields.get(col);
                    Cell cell = row.createCell(col);
                    cell.setCellStyle(dataCellStyle);

                    Object val = rowMap.get(fieldDef.getEntityProperty());
                    if (val == null) {
                        val = rowMap.get(fieldDef.getBusinessName());
                    }

                    if (val != null) {
                        if (val instanceof Number) {
                            cell.setCellValue(((Number) val).doubleValue());
                        } else if (val instanceof Boolean) {
                            cell.setCellValue((Boolean) val);
                        } else {
                            cell.setCellValue(val.toString());
                        }
                    } else {
                        cell.setCellValue("");
                    }
                }
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Ultra-fast Streaming CSV export directly to disk file for up to 15 Million records.
     * Memory usage: O(1) (< 2MB buffer)
     */
    public static void writeCsvHeader(CSVPrinter printer, List<ModuleMetadata.FieldDefinition> fields) throws IOException {
        List<String> headers = new ArrayList<>();
        for (ModuleMetadata.FieldDefinition def : fields) {
            headers.add(def.getBusinessName());
        }
        printer.printRecord(headers);
    }

    public static void writeCsvRow(CSVPrinter printer, List<ModuleMetadata.FieldDefinition> fields, Map<String, Object> rowMap) throws IOException {
        List<Object> values = new ArrayList<>();
        for (ModuleMetadata.FieldDefinition def : fields) {
            Object val = rowMap.get(def.getEntityProperty());
            if (val == null) {
                val = rowMap.get(def.getBusinessName());
            }
            values.add(val != null ? val : "");
        }
        printer.printRecord(values);
    }

    public static CSVPrinter createCsvPrinter(Writer writer) throws IOException {
        return new CSVPrinter(writer, CSVFormat.DEFAULT.builder().setRecordSeparator("\r\n").build());
    }
}
