package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.HygieneProductDTO;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.entity.HygieneProduct;
import com.veterinary.research.excel.ExcelHelper;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.HygieneProductRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.HygieneProductService;
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
public class HygieneProductServiceImpl implements HygieneProductService {

    private final HygieneProductRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<HygieneProductDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<HygieneProduct> spec = SearchSpecifications.hygieneProductSpec(search, filters);
        Page<HygieneProduct> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), HygieneProductDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<HygieneProductDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<HygieneProduct> records;

        if (!request.isKeyset()) {
            Page<HygieneProduct> firstPage = repository.findAll(
                    SearchSpecifications.hygieneProductSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), HygieneProductDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<HygieneProductDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, HygieneProductDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public HygieneProductDTO getById(Long id) {
        HygieneProduct entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HygieneProduct", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public HygieneProductDTO create(HygieneProductDTO dto) {
        HygieneProduct entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public HygieneProductDTO update(Long id, HygieneProductDTO dto) {
        HygieneProduct entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HygieneProduct", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("HygieneProduct", "id", id);
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
    @Cacheable(value = "filter_options", key = "'hygiene_products'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("brands", repository.findDistinctBrands());
        options.put("categories", repository.findDistinctCategories());
        options.put("subCategories", repository.findDistinctSubCategories());
        options.put("petTypes", repository.findDistinctPetTypes());
        options.put("formulations", repository.findDistinctFormulations());
        options.put("manufacturers", repository.findDistinctManufacturers());
        options.put("availabilities", repository.findDistinctAvailabilities());
        options.put("statuses", repository.findDistinctStatuses());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("hygiene", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<HygieneProduct> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            HygieneProduct entity = HygieneProduct.builder()
                    .productName((String) (row.get("Product Name") != null ? row.get("Product Name") : row.get("productName")))
                    .brandName((String) (row.get("Brand Name") != null ? row.get("Brand Name") : row.get("brandName")))
                    .productCategory((String) (row.get("Product Category") != null ? row.get("Product Category") : row.get("productCategory")))
                    .subCategory((String) (row.get("Sub Category") != null ? row.get("Sub Category") : row.get("subCategory")))
                    .petType((String) (row.get("Pet Type") != null ? row.get("Pet Type") : row.get("petType")))
                    .formulation((String) (row.get("Formulation") != null ? row.get("Formulation") : row.get("formulation")))
                    .dosage((String) (row.get("Dosage") != null ? row.get("Dosage") : row.get("dosage")))
                    .price(ExcelHelper.parseBigDecimal(row.get("Price") != null ? row.get("Price") : row.get("price")))
                    .packSize((String) (row.get("Pack Size") != null ? row.get("Pack Size") : row.get("packSize")))
                    .manufacturer((String) (row.get("Manufacturer") != null ? row.get("Manufacturer") : row.get("manufacturer")))
                    .availability((String) (row.get("Availability") != null ? row.get("Availability") : row.get("availability")))
                    .rating(ExcelHelper.parseBigDecimal(row.get("Rating") != null ? row.get("Rating") : row.get("rating")))
                    .reviewsCount(ExcelHelper.parseInteger(row.get("Reviews Count") != null ? row.get("Reviews Count") : row.get("reviewsCount")))
                    .productLink((String) (row.get("Product Link") != null ? row.get("Product Link") : row.get("productLink")))
                    .productUrl((String) (row.get("Product URL") != null ? row.get("Product URL") : row.get("productUrl")))
                    .status((String) (row.get("Status") != null ? row.get("Status") : row.get("status")))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<HygieneProduct> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<HygieneProduct> spec = SearchSpecifications.hygieneProductSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (HygieneProduct h : records) {
            dataRows.add(toMap(h));
        }

        return excelService.exportToExcel("hygiene", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("hygiene", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<HygieneProduct> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (HygieneProduct h : chunk) {
                maps.add(toMap(h));
            }
            return maps;
        }, totalCount);
    }

    private Map<String, Object> toMap(HygieneProduct h) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", h.getId());
        map.put("productName", h.getProductName());
        map.put("brandName", h.getBrandName());
        map.put("productCategory", h.getProductCategory());
        map.put("subCategory", h.getSubCategory());
        map.put("petType", h.getPetType());
        map.put("formulation", h.getFormulation());
        map.put("dosage", h.getDosage());
        map.put("price", h.getPrice());
        map.put("packSize", h.getPackSize());
        map.put("manufacturer", h.getManufacturer());
        map.put("availability", h.getAvailability());
        map.put("rating", h.getRating());
        map.put("reviewsCount", h.getReviewsCount());
        map.put("productLink", h.getProductLink());
        map.put("productUrl", h.getProductUrl());
        map.put("status", h.getStatus());
        return map;
    }
}
