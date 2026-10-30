package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.LivestockDTO;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.entity.Livestock;
import com.veterinary.research.excel.ExcelHelper;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.LivestockRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.LivestockService;
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
public class LivestockServiceImpl implements LivestockService {

    private final LivestockRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<LivestockDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<Livestock> spec = SearchSpecifications.livestockSpec(search, filters);
        Page<Livestock> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), LivestockDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<LivestockDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<Livestock> records;

        if (!request.isKeyset()) {
            Page<Livestock> firstPage = repository.findAll(
                    SearchSpecifications.livestockSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), LivestockDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<LivestockDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, LivestockDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public LivestockDTO getById(Long id) {
        Livestock entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livestock", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public LivestockDTO create(LivestockDTO dto) {
        Livestock entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public LivestockDTO update(Long id, LivestockDTO dto) {
        Livestock entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livestock", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Livestock", "id", id);
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
    @Cacheable(value = "filter_options", key = "'livestock'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("names", repository.findDistinctNames());
        options.put("livestockTypes", repository.findDistinctLivestockTypes());
        options.put("farmTypes", repository.findDistinctFarmTypes());
        options.put("states", repository.findDistinctStates());
        options.put("districts", repository.findDistinctDistricts());
        options.put("businessStatuses", repository.findDistinctBusinessStatuses());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("livestock", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<Livestock> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            Livestock entity = Livestock.builder()
                    .name(getString(row, "Name", "name", "farmName"))
                    .livestockType(getString(row, "Livestock_Type", "livestockType", "livestock_type", "Livestock Type", "type"))
                    .farmType(getString(row, "Farm_Type", "farmType", "farm_type", "Farm Type"))
                    .contactNumber(getString(row, "Contact_Number", "contactNumber", "contact_number", "Contact Number", "phone"))
                    .email(getString(row, "Email", "email", "Email_ID"))
                    .website(getString(row, "Website", "website"))
                    .address(getString(row, "Address", "address"))
                    .area(getString(row, "Area", "area"))
                    .district(getString(row, "District", "district"))
                    .state(getString(row, "State", "state"))
                    .pincode(getString(row, "Pincode", "pincode"))
                    .services(getString(row, "Services", "services"))
                    .rating(ExcelHelper.parseBigDecimal(getValue(row, "Rating", "rating")))
                    .reviewsCount(parseInteger(getValue(row, "Reviews_Count", "reviewsCount", "reviews_count", "Reviews Count", "reviews")))
                    .businessStatus(getString(row, "Business_Status", "businessStatus", "business_status", "Business Status", "status"))
                    .googleMaps(getString(row, "Google_Maps", "googleMaps", "google_maps", "Google Maps", "mapsLink"))
                    .sourceUrl(getString(row, "Source_URL", "sourceUrl", "source_url", "Source URL", "source"))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<Livestock> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<Livestock> spec = SearchSpecifications.livestockSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (Livestock ls : records) {
            dataRows.add(toMap(ls));
        }

        return excelService.exportToExcel("livestock", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("livestock", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<Livestock> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (Livestock ls : chunk) {
                maps.add(toMap(ls));
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

    private Object getValue(Map<String, Object> row, String... keys) {
        for (String key : keys) {
            Object v = row.get(key);
            if (v != null) return v;
        }
        return null;
    }

    private Integer parseInteger(Object val) {
        if (val == null) return null;
        try {
            return Integer.parseInt(val.toString().replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return null;
        }
    }

    private Map<String, Object> toMap(Livestock ls) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", ls.getId());
        map.put("name", ls.getName());
        map.put("livestockType", ls.getLivestockType());
        map.put("farmType", ls.getFarmType());
        map.put("contactNumber", ls.getContactNumber());
        map.put("email", ls.getEmail());
        map.put("website", ls.getWebsite());
        map.put("address", ls.getAddress());
        map.put("area", ls.getArea());
        map.put("district", ls.getDistrict());
        map.put("state", ls.getState());
        map.put("pincode", ls.getPincode());
        map.put("services", ls.getServices());
        map.put("rating", ls.getRating());
        map.put("reviewsCount", ls.getReviewsCount());
        map.put("businessStatus", ls.getBusinessStatus());
        map.put("googleMaps", ls.getGoogleMaps());
        map.put("sourceUrl", ls.getSourceUrl());
        return map;
    }
}

