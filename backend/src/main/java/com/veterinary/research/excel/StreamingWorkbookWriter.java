package com.veterinary.research.excel;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

import java.io.Closeable;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;

public class StreamingWorkbookWriter implements Closeable {

    private final SXSSFWorkbook workbook;
    private final SXSSFSheet sheet;
    private final OutputStream outputStream;
    private final List<ModuleMetadata.FieldDefinition> fields;
    private final CellStyle dataCellStyle;
    private int currentRowIndex = 0;

    public StreamingWorkbookWriter(OutputStream outputStream, String sheetName, List<ModuleMetadata.FieldDefinition> fields) {
        this.outputStream = outputStream;
        this.fields = fields;
        this.workbook = new SXSSFWorkbook(200); // Flush to disk every 200 rows
        this.workbook.setCompressTempFiles(true);
        this.sheet = this.workbook.createSheet(sheetName);

        // Header style
        Font headerFont = this.workbook.createFont();
        headerFont.setBold(true);
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        headerFont.setFontHeightInPoints((short) 11);

        CellStyle headerCellStyle = this.workbook.createCellStyle();
        headerCellStyle.setFont(headerFont);
        headerCellStyle.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
        headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerCellStyle.setAlignment(HorizontalAlignment.LEFT);
        headerCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        // Data style
        this.dataCellStyle = this.workbook.createCellStyle();
        this.dataCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        // Write header
        Row headerRow = this.sheet.createRow(this.currentRowIndex++);
        headerRow.setHeightInPoints(24);
        for (int i = 0; i < fields.size(); i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(fields.get(i).getBusinessName());
            cell.setCellStyle(headerCellStyle);
        }
    }

    public void writeRow(Map<String, Object> rowMap) {
        Row row = this.sheet.createRow(this.currentRowIndex++);
        row.setHeightInPoints(20);

        for (int i = 0; i < fields.size(); i++) {
            ModuleMetadata.FieldDefinition def = fields.get(i);
            Cell cell = row.createCell(i);
            cell.setCellStyle(this.dataCellStyle);

            Object val = rowMap.get(def.getEntityProperty());
            if (val == null) {
                val = rowMap.get(def.getBusinessName());
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

    @Override
    public void close() throws IOException {
        try {
            this.workbook.write(this.outputStream);
            this.outputStream.flush();
        } finally {
            this.workbook.close();
        }
    }
}
