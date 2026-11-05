package com.veterinary.research.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.veterinary.research.dto.*;
import com.veterinary.research.service.DynamicSidebarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sidebar")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DynamicSidebarController {

    private final DynamicSidebarService dynamicSidebarService;
    private final ObjectMapper objectMapper;

    /**
     * 1. Upload & Analyze Excel/CSV file to extract structure, fields, and preview records
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ExcelAnalysisDTO>> uploadAndAnalyze(
            @RequestParam("file") MultipartFile file
    ) {
        log.info("Received request to upload and analyze file: {}", file.getOriginalFilename());
        ExcelAnalysisDTO analysis = dynamicSidebarService.analyzeFile(file);
        return ResponseEntity.ok(ApiResponse.success("File analyzed successfully", analysis));
    }

    /**
     * 2. Analyze Excel/CSV file endpoint alias
     */
    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<ExcelAnalysisDTO>> analyzeFile(
            @RequestParam("file") MultipartFile file
    ) {
        log.info("Received analyze request for file: {}", file.getOriginalFilename());
        ExcelAnalysisDTO analysis = dynamicSidebarService.analyzeFile(file);
        return ResponseEntity.ok(ApiResponse.success("File analyzed successfully", analysis));
    }

    /**
     * 3. Create Dynamic Sidebar Module and persist fields & records
     * Accepts either pure application/json OR multipart/form-data (with optional direct file)
     */
    @PostMapping(value = {"/create", "/create-multipart"})
    public ResponseEntity<ApiResponse<SidebarModuleDTO>> createModule(
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "request", required = false) String formRequestJson,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws Exception {
        String contentType = request.getContentType();
        CreateModuleRequest req;

        if (contentType != null && contentType.toLowerCase().contains("multipart")) {
            if (formRequestJson == null || formRequestJson.isBlank()) {
                throw new IllegalArgumentException("Form field 'request' containing module JSON is required for multipart upload");
            }
            req = objectMapper.readValue(formRequestJson, CreateModuleRequest.class);
        } else {
            req = objectMapper.readValue(request.getInputStream(), CreateModuleRequest.class);
        }

        if (req == null || req.getSidebarName() == null || req.getSidebarName().isBlank()) {
            throw new IllegalArgumentException("Sidebar Name is required");
        }

        log.info("Creating dynamic sidebar module: '{}'", req.getSidebarName());
        SidebarModuleDTO created = dynamicSidebarService.createModule(req, file);
        return ResponseEntity.ok(ApiResponse.success("Sidebar module created successfully", created));
    }

    /**
     * 4. Get all active dynamic sidebar modules (for sidebar menu navigation)
     */
    @GetMapping("/modules")
    public ResponseEntity<ApiResponse<List<SidebarModuleDTO>>> getAllModules() {
        List<SidebarModuleDTO> modules = dynamicSidebarService.getAllActiveModules();
        return ResponseEntity.ok(ApiResponse.success("Dynamic modules fetched successfully", modules));
    }

    /**
     * 5. Get dynamic sidebar module details by ID
     */
    @GetMapping("/modules/{id}")
    public ResponseEntity<ApiResponse<SidebarModuleDTO>> getModuleById(@PathVariable Long id) {
        SidebarModuleDTO module = dynamicSidebarService.getModuleById(id);
        return ResponseEntity.ok(ApiResponse.success("Module fetched successfully", module));
    }

    /**
     * 6. Get dynamic sidebar module details by URL slug
     */
    @GetMapping("/modules/slug/{slug}")
    public ResponseEntity<ApiResponse<SidebarModuleDTO>> getModuleBySlug(@PathVariable String slug) {
        SidebarModuleDTO module = dynamicSidebarService.getModuleBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Module fetched successfully", module));
    }

    /**
     * 7. Get fields configuration for a module
     */
    @GetMapping("/modules/{id}/fields")
    public ResponseEntity<ApiResponse<List<SidebarFieldDTO>>> getModuleFields(
            @PathVariable Long id,
            @RequestParam(required = false) String sheetName
    ) {
        List<SidebarFieldDTO> fields = dynamicSidebarService.getModuleFields(id, sheetName);
        return ResponseEntity.ok(ApiResponse.success("Fields fetched successfully", fields));
    }

    /**
     * 8. Get dynamic records for a module with search, pagination, and sorting
     */
    @GetMapping("/modules/{id}/records")
    public ResponseEntity<ApiResponse<PageResponse<Map<String, Object>>>> getModuleRecords(
            @PathVariable Long id,
            @RequestParam(required = false) String sheetName,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortField,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam Map<String, String> allParams
    ) {
        Map<String, String> filters = new HashMap<>(allParams);
        filters.remove("sheetName");
        filters.remove("search");
        filters.remove("page");
        filters.remove("size");
        filters.remove("sortField");
        filters.remove("sortDir");

        PageResponse<Map<String, Object>> records = dynamicSidebarService.getModuleRecords(
                id, sheetName, search, page, size, sortField, sortDir, filters
        );
        return ResponseEntity.ok(ApiResponse.success("Records fetched successfully", records));
    }

    /**
     * 9. Update module metadata (name, description, status)
     */
    @PutMapping("/modules/{id}")
    public ResponseEntity<ApiResponse<SidebarModuleDTO>> updateModule(
            @PathVariable Long id,
            @Valid @RequestBody UpdateModuleRequest request
    ) {
        SidebarModuleDTO updated = dynamicSidebarService.updateModule(id, request);
        return ResponseEntity.ok(ApiResponse.success("Module updated successfully", updated));
    }

    /**
     * 10. Delete a dynamic sidebar module and its records
     */
    @DeleteMapping("/modules/{id}")
    public ResponseEntity<ApiResponse<String>> deleteModule(@PathVariable Long id) {
        dynamicSidebarService.deleteModule(id);
        return ResponseEntity.ok(ApiResponse.success("Module deleted successfully", "Module deleted successfully"));
    }

    /**
     * 11. Bulk delete records in a module
     */
    @DeleteMapping("/modules/{id}/records")
    public ResponseEntity<ApiResponse<String>> deleteRecords(
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> body
    ) {
        List<Long> recordIds = body.get("recordIds");
        if (recordIds == null || recordIds.isEmpty()) {
            throw new IllegalArgumentException("No record IDs provided for deletion");
        }
        dynamicSidebarService.deleteRecords(id, recordIds);
        return ResponseEntity.ok(ApiResponse.success("Records deleted successfully", recordIds.size() + " records deleted"));
    }

    /**
     * 12. Replace Excel file for an existing module and re-populate records
     */
    @PostMapping("/modules/{id}/replace-file")
    public ResponseEntity<ApiResponse<SidebarModuleDTO>> replaceFile(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        SidebarModuleDTO updated = dynamicSidebarService.replaceFile(id, file);
        return ResponseEntity.ok(ApiResponse.success("File replaced and records updated successfully", updated));
    }

    /**
     * 13. Export module records to Excel (.xlsx)
     */
    @GetMapping("/modules/{id}/export")
    public ResponseEntity<byte[]> exportModule(
            @PathVariable Long id,
            @RequestParam(required = false) String sheetName
    ) {
        SidebarModuleDTO module = dynamicSidebarService.getModuleById(id);
        byte[] excelBytes = dynamicSidebarService.exportModuleToExcel(id, sheetName);

        String fileName = (module.getModuleSlug() != null ? module.getModuleSlug() : "module_" + id) + "_export.xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}

