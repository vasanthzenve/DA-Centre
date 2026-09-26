package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.MarketResearchDTO;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.entity.MarketResearch;
import com.veterinary.research.excel.ExcelHelper;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.MarketResearchRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.MarketResearchService;
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
public class MarketResearchServiceImpl implements MarketResearchService {

    private final MarketResearchRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketResearchDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<MarketResearch> spec = SearchSpecifications.marketResearchSpec(search, filters);
        Page<MarketResearch> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), MarketResearchDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketResearchDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<MarketResearch> records;

        if (!request.isKeyset()) {
            Page<MarketResearch> firstPage = repository.findAll(
                    SearchSpecifications.marketResearchSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), MarketResearchDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<MarketResearchDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, MarketResearchDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public MarketResearchDTO getById(Long id) {
        MarketResearch entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MarketResearch", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public MarketResearchDTO create(MarketResearchDTO dto) {
        MarketResearch entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public MarketResearchDTO update(Long id, MarketResearchDTO dto) {
        MarketResearch entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MarketResearch", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("MarketResearch", "id", id);
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
    @Cacheable(value = "filter_options", key = "'market_research'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("states", repository.findDistinctStates());
        options.put("companies", repository.findDistinctCompanies());
        options.put("cities", repository.findDistinctCities());
        options.put("models", repository.findDistinctModels());
        options.put("scales", repository.findDistinctScales());
        options.put("targetSegments", repository.findDistinctTargetSegments());
        options.put("technologies", repository.findDistinctTechnologies());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("market_research", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<MarketResearch> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            String states = (String) (row.get("States") != null ? row.get("States") : row.get("states"));
            String rawPrice = row.get("Price") != null ? row.get("Price").toString() : (row.get("price") != null ? row.get("price").toString() : null);
            String rawProduct = (String) (row.get("Product") != null ? row.get("Product") : row.get("product"));
            String rawTechnology = (String) (row.get("Technology") != null ? row.get("Technology") : row.get("technology"));

            // Intelligent handling if imported sheet omitted Price column and shifted Product/Technology
            if ((rawTechnology == null || rawTechnology.isBlank()) && rawProduct != null && rawPrice != null) {
                String lowerProd = rawProduct.toLowerCase();
                if (lowerProd.contains("equipment") || lowerProd.contains("diagnostic") || lowerProd.contains("ultrasound")
                        || lowerProd.contains("x-ray") || lowerProd.contains("clinical") || lowerProd.contains("platform")
                        || lowerProd.contains("teleconsultation") || lowerProd.contains("room") || lowerProd.contains("setup")
                        || lowerProd.contains("app") || lowerProd.contains("table") || lowerProd.contains("bed")
                        || "Goa".equalsIgnoreCase(states) || "Chhattisgarh".equalsIgnoreCase(states)
                        || "Arunachal Pradesh".equalsIgnoreCase(states) || "Andhra Pradesh".equalsIgnoreCase(states)
                        || "Assam".equalsIgnoreCase(states) || "Bihar".equalsIgnoreCase(states)) {
                    rawTechnology = rawProduct;
                    rawProduct = rawPrice;
                    rawPrice = "Not publicly disclosed";
                }
            }

            MarketResearch entity = MarketResearch.builder()
                    .states(states)
                    .company((String) (row.get("Company") != null ? row.get("Company") : row.get("company")))
                    .founded((String) (row.get("Founded") != null ? row.get("Founded") : row.get("founded")))
                    .cities((String) (row.get("Cities") != null ? row.get("Cities") : row.get("cities")))
                    .model((String) (row.get("Model") != null ? row.get("Model") : row.get("model")))
                    .scale((String) (row.get("Scale") != null ? row.get("Scale") : row.get("scale")))
                    .funding((String) (row.get("Funding") != null ? row.get("Funding") : row.get("funding")))
                    .service((String) (row.get("Service") != null ? row.get("Service") : row.get("service")))
                    .revenue((String) (row.get("Revenue") != null ? row.get("Revenue") : row.get("revenue")))
                    .targetSegment((String) (row.get("Target Segment") != null ? row.get("Target Segment") : row.get("targetSegment")))
                    .price(rawPrice != null ? rawPrice.replace("?", "₹") : null)
                    .product(rawProduct)
                    .technology(rawTechnology)
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<MarketResearch> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<MarketResearch> spec = SearchSpecifications.marketResearchSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (MarketResearch r : records) {
            dataRows.add(toMap(r));
        }

        return excelService.exportToExcel("market_research", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("market_research", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<MarketResearch> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (MarketResearch r : chunk) {
                maps.add(toMap(r));
            }
            return maps;
        }, totalCount);
    }

    private Map<String, Object> toMap(MarketResearch r) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", r.getId());
        map.put("states", r.getStates());
        map.put("company", r.getCompany());
        map.put("founded", r.getFounded());
        map.put("cities", r.getCities());
        map.put("model", r.getModel());
        map.put("scale", r.getScale());
        map.put("funding", r.getFunding());
        map.put("service", r.getService());
        map.put("revenue", r.getRevenue());
        map.put("targetSegment", r.getTargetSegment());
        map.put("price", r.getPrice());
        map.put("product", r.getProduct());
        map.put("technology", r.getTechnology());
        return map;
    }
}
