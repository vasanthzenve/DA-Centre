package com.veterinary.research.service;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.dto.VeterinaryEcosystemDTO;
import com.veterinary.research.job.JobInfo;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface VeterinaryEcosystemService {
    PageResponse<VeterinaryEcosystemDTO> getAll(String search, Map<String, String> filters, Pageable pageable);
    PageResponse<VeterinaryEcosystemDTO> getByCursor(CursorPageRequest request);
    VeterinaryEcosystemDTO getById(Long id);
    VeterinaryEcosystemDTO create(VeterinaryEcosystemDTO dto);
    VeterinaryEcosystemDTO update(Long id, VeterinaryEcosystemDTO dto);
    void delete(Long id);
    void bulkDelete(List<Long> ids);
    Map<String, List<String>> getFilterOptions();
    ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception;
    int confirmExcelImport(List<Map<String, Object>> validRows);
    byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception;
    JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception;
}
