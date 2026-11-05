package com.veterinary.research.service;

import com.veterinary.research.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface DynamicSidebarService {

    ExcelAnalysisDTO analyzeFile(MultipartFile file);

    SidebarModuleDTO createModule(CreateModuleRequest request, MultipartFile directFile);

    List<SidebarModuleDTO> getAllActiveModules();

    SidebarModuleDTO getModuleById(Long id);

    SidebarModuleDTO getModuleBySlug(String slug);

    List<SidebarFieldDTO> getModuleFields(Long id, String sheetName);

    PageResponse<Map<String, Object>> getModuleRecords(
            Long id,
            String sheetName,
            String search,
            int page,
            int size,
            String sortField,
            String sortDir,
            Map<String, String> filters
    );

    SidebarModuleDTO updateModule(Long id, UpdateModuleRequest request);

    void deleteModule(Long id);

    void deleteRecords(Long id, List<Long> recordIds);

    SidebarModuleDTO replaceFile(Long id, MultipartFile file);

    byte[] exportModuleToExcel(Long id, String sheetName);
}

