package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.dto.PhilippinesPetProductDTO;
import com.veterinary.research.entity.PhilippinesPetProduct;
import com.veterinary.research.excel.ExcelHelper;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.PhilippinesPetProductRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.PhilippinesPetProductService;
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
public class PhilippinesPetProductServiceImpl implements PhilippinesPetProductService {

    private final PhilippinesPetProductRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PhilippinesPetProductDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<PhilippinesPetProduct> spec = SearchSpecifications.philippinesPetProductSpec(search, filters);
        Page<PhilippinesPetProduct> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), PhilippinesPetProductDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PhilippinesPetProductDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<PhilippinesPetProduct> records;

        if (!request.isKeyset()) {
            Page<PhilippinesPetProduct> firstPage = repository.findAll(
                    SearchSpecifications.philippinesPetProductSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), PhilippinesPetProductDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<PhilippinesPetProductDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, PhilippinesPetProductDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public PhilippinesPetProductDTO getById(Long id) {
        PhilippinesPetProduct entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PhilippinesPetProduct", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public PhilippinesPetProductDTO create(PhilippinesPetProductDTO dto) {
        PhilippinesPetProduct entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public PhilippinesPetProductDTO update(Long id, PhilippinesPetProductDTO dto) {
        PhilippinesPetProduct entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PhilippinesPetProduct", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("PhilippinesPetProduct", "id", id);
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
    @Cacheable(value = "filter_options", key = "'philippines_pet_products'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("productNames", repository.findDistinctProductNames());
        options.put("brandNames", repository.findDistinctBrandNames());
        options.put("marketplaceNames", repository.findDistinctMarketplaceNames());
        options.put("availabilities", repository.findDistinctAvailabilities());
        options.put("countries", repository.findDistinctCountries());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("philippines_pet_products", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<PhilippinesPetProduct> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            PhilippinesPetProduct entity = PhilippinesPetProduct.builder()
                    .country(getString(row, "Country", "country"))
                    .productName(getString(row, "Product Name", "productName", "product_name", "Product_Name"))
                    .brandName(getString(row, "Brand Name", "brandName", "brand_name", "Brand_Name"))
                    .productDescription(getString(row, "Product Description", "productDescription", "product_description", "description"))
                    .minimumPricePhp(ExcelHelper.parseBigDecimal(getValue(row, "Minimum Price (PHP)", "minimumPricePhp", "minimum_price_php", "minPrice")))
                    .maximumPricePhp(ExcelHelper.parseBigDecimal(getValue(row, "Maximum Price (PHP)", "maximumPricePhp", "maximum_price_php", "maxPrice")))
                    .currentSellingPricePhp(ExcelHelper.parseBigDecimal(getValue(row, "Current Selling Price (PHP)", "currentSellingPricePhp", "current_selling_price_php", "price", "sellingPrice")))
                    .availability(getString(row, "Availability", "availability"))
                    .marketplaceName(getString(row, "Marketplace Name", "marketplaceName", "marketplace_name", "Marketplace_Name", "marketplace"))
                    .productUrl(getString(row, "Product URL", "productUrl", "product_url", "Product_URL"))
                    .productImageUrl(getString(row, "Product Image URL", "productImageUrl", "product_image_url", "imageUrl"))
                    .sourceUrl(getString(row, "Source URL", "sourceUrl", "source_url", "Source_URL"))
                    .command(getString(row, "Command", "command", "comments"))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<PhilippinesPetProduct> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<PhilippinesPetProduct> spec = SearchSpecifications.philippinesPetProductSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (PhilippinesPetProduct p : records) {
            dataRows.add(toMap(p));
        }

        return excelService.exportToExcel("philippines_pet_products", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("philippines_pet_products", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<PhilippinesPetProduct> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (PhilippinesPetProduct p : chunk) {
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

    private Map<String, Object> toMap(PhilippinesPetProduct p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("country", p.getCountry());
        map.put("productName", p.getProductName());
        map.put("brandName", p.getBrandName());
        map.put("productDescription", p.getProductDescription());
        map.put("minimumPricePhp", p.getMinimumPricePhp());
        map.put("maximumPricePhp", p.getMaximumPricePhp());
        map.put("currentSellingPricePhp", p.getCurrentSellingPricePhp());
        map.put("availability", p.getAvailability());
        map.put("marketplaceName", p.getMarketplaceName());
        map.put("productUrl", p.getProductUrl());
        map.put("productImageUrl", p.getProductImageUrl());
        map.put("sourceUrl", p.getSourceUrl());
        map.put("command", p.getCommand());
        return map;
    }
}

