package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.DoctorDTO;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.entity.Doctor;
import com.veterinary.research.excel.ExcelHelper;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.DoctorRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DoctorDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<Doctor> spec = SearchSpecifications.doctorSpec(search, filters);
        Page<Doctor> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), DoctorDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DoctorDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<Doctor> records;

        if (!request.isKeyset()) {
            Page<Doctor> firstPage = repository.findAll(
                    SearchSpecifications.doctorSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), DoctorDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<DoctorDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, DoctorDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDTO getById(Long id) {
        Doctor entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public DoctorDTO create(DoctorDTO dto) {
        Doctor entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public DoctorDTO update(Long id, DoctorDTO dto) {
        Doctor entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor", "id", id);
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void bulkDelete(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            repository.deleteAllById(ids);
        }
    }

    @Override
    @Cacheable(value = "filter_options", key = "'doctors'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("doctorNames", repository.findDistinctDoctorNames());
        options.put("qualifications", repository.findDistinctQualifications());
        options.put("specialists", repository.findDistinctSpecialists());
        options.put("experiences", repository.findDistinctExperiences());
        options.put("locations", repository.findDistinctLocations());
        options.put("hospitals", repository.findDistinctHospitals());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("doctors", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<Doctor> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            Doctor entity = Doctor.builder()
                    .doctorName((String) (row.get("Doctor Name") != null ? row.get("Doctor Name") : row.get("doctorName")))
                    .qualification((String) (row.get("Qualification") != null ? row.get("Qualification") : row.get("qualification")))
                    .specialist((String) (row.get("Specialist") != null ? row.get("Specialist") : row.get("specialist")))
                    .experience((String) (row.get("Experience") != null ? row.get("Experience") : row.get("experience")))
                    .location((String) (row.get("Location") != null ? row.get("Location") : row.get("location")))
                    .hospital((String) (row.get("Hospital") != null ? row.get("Hospital") : row.get("hospital")))
                    .address((String) (row.get("Address") != null ? row.get("Address") : row.get("address")))
                    .fee(ExcelHelper.parseBigDecimal(row.get("Fee") != null ? row.get("Fee") : row.get("fee")))
                    .workingHours((String) (row.get("Working hrs") != null ? row.get("Working hrs") : row.get("workingHours")))
                    .doctorUrl((String) (row.get("Doctor URL") != null ? row.get("Doctor URL") : row.get("doctorUrl")))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<Doctor> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<Doctor> spec = SearchSpecifications.doctorSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            // Safe bounded fetch for direct export (avoids 15M OOM; large exports should use exportAsync)
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (Doctor d : records) {
            dataRows.add(toMap(d));
        }

        return excelService.exportToExcel("doctors", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("doctors", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<Doctor> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (Doctor d : chunk) {
                maps.add(toMap(d));
            }
            return maps;
        }, totalCount);
    }

    private Map<String, Object> toMap(Doctor d) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", d.getId());
        map.put("doctorName", d.getDoctorName());
        map.put("qualification", d.getQualification());
        map.put("specialist", d.getSpecialist());
        map.put("experience", d.getExperience());
        map.put("location", d.getLocation());
        map.put("hospital", d.getHospital());
        map.put("address", d.getAddress());
        map.put("fee", d.getFee());
        map.put("workingHours", d.getWorkingHours());
        map.put("doctorUrl", d.getDoctorUrl());
        return map;
    }
}
