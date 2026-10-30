package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.dto.PoultryDTO;
import com.veterinary.research.entity.Poultry;
import com.veterinary.research.excel.ExcelHelper;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.PoultryRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.PoultryService;
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
public class PoultryServiceImpl implements PoultryService {

    private final PoultryRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PoultryDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<Poultry> spec = SearchSpecifications.poultrySpec(search, filters);
        Page<Poultry> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), PoultryDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PoultryDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<Poultry> records;

        if (!request.isKeyset()) {
            Page<Poultry> firstPage = repository.findAll(
                    SearchSpecifications.poultrySpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), PoultryDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<PoultryDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, PoultryDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public PoultryDTO getById(Long id) {
        Poultry entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poultry", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public PoultryDTO create(PoultryDTO dto) {
        Poultry entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public PoultryDTO update(Long id, PoultryDTO dto) {
        Poultry entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poultry", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Poultry", "id", id);
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
    @Cacheable(value = "filter_options", key = "'poultry'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("names", repository.findDistinctNames());
        options.put("categories", repository.findDistinctCategories());
        options.put("subCategories", repository.findDistinctSubCategories());
        options.put("states", repository.findDistinctStates());
        options.put("districts", repository.findDistinctDistricts());
        options.put("statuses", repository.findDistinctStatuses());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("poultry", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<Poultry> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            Poultry entity = Poultry.builder()
                    .name(getString(row, "Name", "name", "poultryName"))
                    .category(getString(row, "Category", "category"))
                    .subCategory(getString(row, "Sub_Category", "subCategory", "sub_category", "Sub Category"))
                    .phone(getString(row, "Phone", "phone", "phoneNo", "mobile"))
                    .website(getString(row, "Website", "website"))
                    .address(getString(row, "Address", "address"))
                    .area(getString(row, "Area", "area"))
                    .district(getString(row, "District", "district"))
                    .state(getString(row, "State", "state"))
                    .pincode(getString(row, "Pincode", "pincode"))
                    .businessTag(getString(row, "Business_Tag", "businessTag", "business_tag", "Business Tag", "tag"))
                    .rating(ExcelHelper.parseBigDecimal(getValue(row, "Rating", "rating")))
                    .reviews(getString(row, "Reviews", "reviews", "reviewsCount"))
                    .status(getString(row, "Status", "status", "businessStatus"))
                    .source(getString(row, "Source", "source", "sourceUrl"))
                    .mapsLink(getString(row, "Maps_Link", "mapsLink", "maps_link", "Maps Link", "googleMaps"))
                    .analyst(getString(row, "Analyst", "analyst", "_"))
                    .notes(getString(row, "Notes", "notes", "command", "comments"))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<Poultry> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<Poultry> spec = SearchSpecifications.poultrySpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (Poultry p : records) {
            dataRows.add(toMap(p));
        }

        return excelService.exportToExcel("poultry", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("poultry", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<Poultry> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (Poultry p : chunk) {
                maps.add(toMap(p));
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

    private Map<String, Object> toMap(Poultry p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("category", p.getCategory());
        map.put("subCategory", p.getSubCategory());
        map.put("phone", p.getPhone());
        map.put("website", p.getWebsite());
        map.put("address", p.getAddress());
        map.put("area", p.getArea());
        map.put("district", p.getDistrict());
        map.put("state", p.getState());
        map.put("pincode", p.getPincode());
        map.put("businessTag", p.getBusinessTag());
        map.put("rating", p.getRating());
        map.put("reviews", p.getReviews());
        map.put("status", p.getStatus());
        map.put("source", p.getSource());
        map.put("mapsLink", p.getMapsLink());
        map.put("analyst", p.getAnalyst());
        map.put("notes", p.getNotes());
        return map;
    }
}

