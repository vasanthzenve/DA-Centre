package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CourierTier1DTO;
import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.entity.CourierTier1;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.CourierTier1Repository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.CourierTier1Service;
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
public class CourierTier1ServiceImpl implements CourierTier1Service {

    private final CourierTier1Repository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourierTier1DTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<CourierTier1> spec = SearchSpecifications.courierTier1Spec(search, filters);
        Page<CourierTier1> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), CourierTier1DTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourierTier1DTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<CourierTier1> records;

        if (!request.isKeyset()) {
            Page<CourierTier1> firstPage = repository.findAll(
                    SearchSpecifications.courierTier1Spec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), CourierTier1DTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<CourierTier1DTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, CourierTier1DTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public CourierTier1DTO getById(Long id) {
        CourierTier1 entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CourierTier1", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public CourierTier1DTO create(CourierTier1DTO dto) {
        CourierTier1 entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public CourierTier1DTO update(Long id, CourierTier1DTO dto) {
        CourierTier1 entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CourierTier1", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("CourierTier1", "id", id);
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
    @Cacheable(value = "filter_options", key = "'courier_tier_1'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("companyNames", repository.findDistinctCompanyNames());
        options.put("cities", repository.findDistinctCities());
        options.put("states", repository.findDistinctStates());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("courier_tier_1", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<CourierTier1> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            CourierTier1 entity = CourierTier1.builder()
                    .state(getString(row, "State", "state"))
                    .city(getString(row, "City", "city"))
                    .companyName(getString(row, "Company Name", "companyName", "company_name", "Company_Name"))
                    .address(getString(row, "Address", "address"))
                    .pincode(getString(row, "Pincode", "pincode", "Pin"))
                    .phoneNumber(getString(row, "Phone Number", "phoneNumber", "phone_number", "Phone"))
                    .rating(getDouble(row, "Rating", "rating"))
                    .services(getString(row, "Services", "services"))
                    .website(getString(row, "Website", "website"))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<CourierTier1> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<CourierTier1> spec = SearchSpecifications.courierTier1Spec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (CourierTier1 c : records) {
            dataRows.add(toMap(c));
        }

        return excelService.exportToExcel("courier_tier_1", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("courier_tier_1", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<CourierTier1> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (CourierTier1 c : chunk) {
                maps.add(toMap(c));
            }
            return maps;
        }, totalCount);
    }

    private String getString(Map<String, Object> row, String... keys) {
        for (String key : keys) {
            Object v = row.get(key);
            if (v != null) return v.toString().trim();
        }
        return null;
    }

    private Double getDouble(Map<String, Object> row, String... keys) {
        for (String key : keys) {
            Object v = row.get(key);
            if (v != null) {
                try {
                    return Double.parseDouble(v.toString().trim());
                } catch (NumberFormatException ignored) {}
            }
        }
        return null;
    }

    private Map<String, Object> toMap(CourierTier1 c) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", c.getId());
        map.put("state", c.getState());
        map.put("city", c.getCity());
        map.put("companyName", c.getCompanyName());
        map.put("address", c.getAddress());
        map.put("pincode", c.getPincode());
        map.put("phoneNumber", c.getPhoneNumber());
        map.put("rating", c.getRating());
        map.put("services", c.getServices());
        map.put("website", c.getWebsite());
        return map;
    }
}

