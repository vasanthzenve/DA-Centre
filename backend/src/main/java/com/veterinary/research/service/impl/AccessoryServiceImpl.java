package com.veterinary.research.service.impl;

import com.veterinary.research.dto.AccessoryDTO;
import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.entity.Accessory;
import com.veterinary.research.excel.ExcelHelper;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.AccessoryRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.AccessoryService;
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
public class AccessoryServiceImpl implements AccessoryService {

    private final AccessoryRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccessoryDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<Accessory> spec = SearchSpecifications.accessorySpec(search, filters);
        Page<Accessory> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), AccessoryDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccessoryDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<Accessory> records;

        if (!request.isKeyset()) {
            Page<Accessory> firstPage = repository.findAll(
                    SearchSpecifications.accessorySpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), AccessoryDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<AccessoryDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, AccessoryDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public AccessoryDTO getById(Long id) {
        Accessory entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Accessory", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public AccessoryDTO create(AccessoryDTO dto) {
        Accessory entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public AccessoryDTO update(Long id, AccessoryDTO dto) {
        Accessory entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Accessory", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Accessory", "id", id);
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
    @Cacheable(value = "filter_options", key = "'accessories'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("businessNames", repository.findDistinctBusinessNames());
        options.put("categories", repository.findDistinctCategories());
        options.put("subCategories", repository.findDistinctSubCategories());
        options.put("petTypes", repository.findDistinctPetTypes());
        options.put("availabilities", repository.findDistinctAvailabilities());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("accessories", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<Accessory> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            Accessory entity = Accessory.builder()
                    .businessName((String) (row.get("Business Name") != null ? row.get("Business Name") : row.get("businessName")))
                    .category((String) (row.get("Category") != null ? row.get("Category") : row.get("category")))
                    .subCategory((String) (row.get("Sub Category") != null ? row.get("Sub Category") : row.get("subCategory")))
                    .petType((String) (row.get("Pet Type") != null ? row.get("Pet Type") : row.get("petType")))
                    .productDescription((String) (row.get("Product Description") != null ? row.get("Product Description") : row.get("productDescription")))
                    .price(ExcelHelper.parseBigDecimal(row.get("Price") != null ? row.get("Price") : row.get("price")))
                    .availability((String) (row.get("Availability") != null ? row.get("Availability") : row.get("availability")))
                    .reviewCount(ExcelHelper.parseInteger(row.get("Review Count") != null ? row.get("Review Count") : row.get("reviewCount")))
                    .website((String) (row.get("Website") != null ? row.get("Website") : row.get("website")))
                    .productUrl((String) (row.get("Product URL") != null ? row.get("Product URL") : row.get("productUrl")))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<Accessory> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<Accessory> spec = SearchSpecifications.accessorySpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (Accessory a : records) {
            dataRows.add(toMap(a));
        }

        return excelService.exportToExcel("accessories", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("accessories", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<Accessory> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (Accessory a : chunk) {
                maps.add(toMap(a));
            }
            return maps;
        }, totalCount);
    }

    private Map<String, Object> toMap(Accessory a) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", a.getId());
        map.put("businessName", a.getBusinessName());
        map.put("category", a.getCategory());
        map.put("subCategory", a.getSubCategory());
        map.put("petType", a.getPetType());
        map.put("productDescription", a.getProductDescription());
        map.put("price", a.getPrice());
        map.put("availability", a.getAvailability());
        map.put("reviewCount", a.getReviewCount());
        map.put("website", a.getWebsite());
        map.put("productUrl", a.getProductUrl());
        return map;
    }
}
