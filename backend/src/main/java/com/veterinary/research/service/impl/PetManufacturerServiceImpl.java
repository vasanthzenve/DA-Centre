package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.dto.PetManufacturerDTO;
import com.veterinary.research.entity.PetManufacturer;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.PetManufacturerRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.PetManufacturerService;
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
public class PetManufacturerServiceImpl implements PetManufacturerService {

    private final PetManufacturerRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PetManufacturerDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<PetManufacturer> spec = SearchSpecifications.petManufacturerSpec(search, filters);
        Page<PetManufacturer> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), PetManufacturerDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PetManufacturerDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<PetManufacturer> records;

        if (!request.isKeyset()) {
            Page<PetManufacturer> firstPage = repository.findAll(
                    SearchSpecifications.petManufacturerSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), PetManufacturerDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<PetManufacturerDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, PetManufacturerDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public PetManufacturerDTO getById(Long id) {
        PetManufacturer entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PetManufacturer", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public PetManufacturerDTO create(PetManufacturerDTO dto) {
        PetManufacturer entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public PetManufacturerDTO update(Long id, PetManufacturerDTO dto) {
        PetManufacturer entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PetManufacturer", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("PetManufacturer", "id", id);
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
    @Cacheable(value = "filter_options", key = "'pet_manufacturers'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("manufacturerNames", repository.findDistinctManufacturerNames());
        options.put("productCategories", repository.findDistinctProductCategories());
        options.put("countries", repository.findDistinctCountries());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("pet_manufacturers", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<PetManufacturer> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            PetManufacturer entity = PetManufacturer.builder()
                    .country(getString(row, "country", "Country"))
                    .manufacturerName(getString(row, "Manufacturer_Name", "manufacturerName", "manufacturer_name", "Manufacturer Name"))
                    .manufacturerAddress(getString(row, "Manufacturer_Address", "manufacturerAddress", "manufacturer_address", "Address"))
                    .productCategory(getString(row, "Product_Category", "productCategory", "product_category", "Category"))
                    .mobileNumber(getString(row, "Mobile_Number", "mobileNumber", "mobile_number", "Phone"))
                    .emailId(getString(row, "Email_ID", "emailId", "email_id", "Email ID", "email"))
                    .website(getString(row, "Website", "website"))
                    .exportCountries(getString(row, "Export Countries", "exportCountries", "export_countries"))
                    .sourceUrl(getString(row, "Source URL", "sourceUrl", "source_url"))
                    .verification(getString(row, "Verification", "verification"))
                    .analyst(getString(row, "Analyst", "analyst"))
                    .command(getString(row, "command", "Command", "notes"))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<PetManufacturer> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<PetManufacturer> spec = SearchSpecifications.petManufacturerSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (PetManufacturer m : records) {
            dataRows.add(toMap(m));
        }

        return excelService.exportToExcel("pet_manufacturers", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("pet_manufacturers", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<PetManufacturer> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (PetManufacturer m : chunk) {
                maps.add(toMap(m));
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

    private Map<String, Object> toMap(PetManufacturer m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("country", m.getCountry());
        map.put("manufacturerName", m.getManufacturerName());
        map.put("manufacturerAddress", m.getManufacturerAddress());
        map.put("productCategory", m.getProductCategory());
        map.put("mobileNumber", m.getMobileNumber());
        map.put("emailId", m.getEmailId());
        map.put("website", m.getWebsite());
        map.put("exportCountries", m.getExportCountries());
        map.put("sourceUrl", m.getSourceUrl());
        map.put("verification", m.getVerification());
        map.put("analyst", m.getAnalyst());
        map.put("command", m.getCommand());
        return map;
    }
}

