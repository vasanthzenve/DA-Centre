package com.veterinary.research.controller;

import com.veterinary.research.dto.ApiResponse;
import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.dto.ServiceNetworkDTO;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.service.ServiceNetworkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service-network")
@RequiredArgsConstructor
public class ServiceNetworkController {

    private final ServiceNetworkService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ServiceNetworkDTO>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "next") String direction,
            @RequestParam Map<String, String> allParams
    ) {
        allParams.remove("page");
        allParams.remove("size");
        allParams.remove("sort");
        allParams.remove("search");
        allParams.remove("cursor");
        allParams.remove("direction");

        if (cursor != null && cursor > 0) {
            CursorPageRequest cursorReq = CursorPageRequest.builder()
                    .cursor(cursor)
                    .direction(direction)
                    .size(size)
                    .search(search)
                    .filters(allParams)
                    .build();
            return ResponseEntity.ok(ApiResponse.success(service.getByCursor(cursorReq)));
        }

        String[] sortParts = sort.split(",");
        Sort sortObj = Sort.by(
                sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortParts[0]
        );
        Pageable pageable = PageRequest.of(page, size, sortObj);

        PageResponse<ServiceNetworkDTO> response = service.getAll(search, allParams, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceNetworkDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceNetworkDTO>> create(@Valid @RequestBody ServiceNetworkDTO dto) {
        ServiceNetworkDTO created = service.create(dto);
        return ResponseEntity.ok(ApiResponse.success("Service Network record created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceNetworkDTO>> update(@PathVariable Long id, @Valid @RequestBody ServiceNetworkDTO dto) {
        ServiceNetworkDTO updated = service.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Service Network record updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Service Network record deleted successfully", null));
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<ApiResponse<Void>> bulkDelete(@RequestBody List<Long> ids) {
        service.bulkDelete(ids);
        return ResponseEntity.ok(ApiResponse.success("Deleted " + ids.size() + " records successfully", null));
    }

    @GetMapping("/filter-options")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> getFilterOptions() {
        return ResponseEntity.ok(ApiResponse.success(service.getFilterOptions()));
    }

    @PostMapping("/import-excel/preview")
    public ResponseEntity<ApiResponse<ExcelDTOs.ExcelPreviewResponse>> previewExcel(@RequestParam("file") MultipartFile file) throws Exception {
        ExcelDTOs.ExcelPreviewResponse preview = service.previewExcel(file);
        return ResponseEntity.ok(ApiResponse.success("Excel parsed successfully", preview));
    }

    @PostMapping("/import-excel/confirm")
    public ResponseEntity<ApiResponse<Integer>> confirmImport(@RequestBody ExcelDTOs.ExcelConfirmRequest request) {
        int importedCount = service.confirmExcelImport(request.getValidRows());
        return ResponseEntity.ok(ApiResponse.success("Successfully imported " + importedCount + " records", importedCount));
    }

    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(required = false) String search,
            @RequestParam Map<String, String> allParams
    ) throws Exception {
        allParams.remove("type");
        allParams.remove("search");
        byte[] bytes = service.exportExcel(type, null, search, allParams);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Service Network.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    @PostMapping("/export-excel")
    public ResponseEntity<byte[]> exportExcelPost(@RequestBody ExcelDTOs.ExportRequest request) throws Exception {
        byte[] bytes = service.exportExcel(request.getScope(), request.getSelectedIds(), request.getSearch(), request.getFilters());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Service Network.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    @PostMapping("/export-async")
    public ResponseEntity<ApiResponse<JobInfo>> exportAsync(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(defaultValue = "all") String scope,
            @RequestBody(required = false) ExcelDTOs.ExportRequest request
    ) throws Exception {
        List<Long> selectedIds = request != null ? request.getSelectedIds() : null;
        String search = request != null ? request.getSearch() : null;
        Map<String, String> filters = request != null ? request.getFilters() : null;
        String actualScope = request != null && request.getScope() != null ? request.getScope() : scope;

        JobInfo job = service.exportAsync(format, actualScope, selectedIds, search, filters);
        return ResponseEntity.ok(ApiResponse.success("Export job started in background", job));
    }
}
