package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.FoodProductDTO;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.entity.FoodProduct;
import com.veterinary.research.excel.ExcelHelper;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.FoodProductRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.FoodProductService;
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
public class FoodProductServiceImpl implements FoodProductService {

    private final FoodProductRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FoodProductDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<FoodProduct> spec = SearchSpecifications.foodProductSpec(search, filters);
        Page<FoodProduct> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), FoodProductDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FoodProductDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<FoodProduct> records;

        if (!request.isKeyset()) {
            Page<FoodProduct> firstPage = repository.findAll(
                    SearchSpecifications.foodProductSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), FoodProductDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<FoodProductDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, FoodProductDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public FoodProductDTO getById(Long id) {
        FoodProduct entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FoodProduct", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public FoodProductDTO create(FoodProductDTO dto) {
        FoodProduct entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public FoodProductDTO update(Long id, FoodProductDTO dto) {
        FoodProduct entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FoodProduct", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("FoodProduct", "id", id);
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
    @Cacheable(value = "filter_options", key = "'food_products'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("brands", repository.findDistinctBrands());
        options.put("categories", repository.findDistinctCategories());
        options.put("subCategories", repository.findDistinctSubCategories());
        options.put("petTypes", repository.findDistinctPetTypes());
        options.put("lifeStages", repository.findDistinctLifeStages());
        options.put("breedSizes", repository.findDistinctBreedSizes());
        options.put("dietaryTypes", repository.findDistinctDietaryTypes());
        options.put("formulations", repository.findDistinctFormulations());
        options.put("manufacturers", repository.findDistinctManufacturers());
        options.put("availabilities", repository.findDistinctAvailabilities());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("food", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<FoodProduct> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            FoodProduct entity = FoodProduct.builder()
                    .productName((String) (row.get("Product Name") != null ? row.get("Product Name") : row.get("productName")))
                    .brandName((String) (row.get("Brand Name") != null ? row.get("Brand Name") : row.get("brandName")))
                    .productCategory((String) (row.get("Product Category") != null ? row.get("Product Category") : row.get("productCategory")))
                    .subCategory((String) (row.get("Sub Category") != null ? row.get("Sub Category") : row.get("subCategory")))
                    .petType((String) (row.get("Pet Type") != null ? row.get("Pet Type") : row.get("petType")))
                    .lifeStage((String) (row.get("Life Stage") != null ? row.get("Life Stage") : row.get("lifeStage")))
                    .breedSize((String) (row.get("Breed Size") != null ? row.get("Breed Size") : row.get("breedSize")))
                    .dietaryType((String) (row.get("Dietary Type") != null ? row.get("Dietary Type") : row.get("dietaryType")))
                    .formulation((String) (row.get("Formulation") != null ? row.get("Formulation") : row.get("formulation")))
                    .packSize((String) (row.get("Pack Size") != null ? row.get("Pack Size") : row.get("packSize")))
                    .price(ExcelHelper.parseBigDecimal(row.get("Price") != null ? row.get("Price") : row.get("price")))
                    .manufacturer((String) (row.get("Manufacturer") != null ? row.get("Manufacturer") : row.get("manufacturer")))
                    .availability((String) (row.get("Availability") != null ? row.get("Availability") : row.get("availability")))
                    .rating(ExcelHelper.parseBigDecimal(row.get("Rating") != null ? row.get("Rating") : row.get("rating")))
                    .reviewsCount(ExcelHelper.parseInteger(row.get("Reviews Count") != null ? row.get("Reviews Count") : row.get("reviewsCount")))
                    .websiteMarketplace((String) (row.get("Website / Marketplace") != null ? row.get("Website / Marketplace") : row.get("websiteMarketplace")))
                    .productUrl((String) (row.get("Product URL") != null ? row.get("Product URL") : row.get("productUrl")))
                    .sourceUrl((String) (row.get("Source URL") != null ? row.get("Source URL") : row.get("sourceUrl")))
                    .address((String) (row.get("Address") != null ? row.get("Address") : row.get("address")))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<FoodProduct> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<FoodProduct> spec = SearchSpecifications.foodProductSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (FoodProduct f : records) {
            dataRows.add(toMap(f));
        }

        return excelService.exportToExcel("food", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("food", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<FoodProduct> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (FoodProduct f : chunk) {
                maps.add(toMap(f));
            }
            return maps;
        }, totalCount);
    }

    private Map<String, Object> toMap(FoodProduct f) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", f.getId());
        map.put("productName", f.getProductName());
        map.put("brandName", f.getBrandName());
        map.put("productCategory", f.getProductCategory());
        map.put("subCategory", f.getSubCategory());
        map.put("petType", f.getPetType());
        map.put("lifeStage", f.getLifeStage());
        map.put("breedSize", f.getBreedSize());
        map.put("dietaryType", f.getDietaryType());
        map.put("formulation", f.getFormulation());
        map.put("packSize", f.getPackSize());
        map.put("price", f.getPrice());
        map.put("manufacturer", f.getManufacturer());
        map.put("availability", f.getAvailability());
        map.put("rating", f.getRating());
        map.put("reviewsCount", f.getReviewsCount());
        map.put("websiteMarketplace", f.getWebsiteMarketplace());
        map.put("productUrl", f.getProductUrl());
        map.put("sourceUrl", f.getSourceUrl());
        map.put("address", f.getAddress());
        return map;
    }
}
