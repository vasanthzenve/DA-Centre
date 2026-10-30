package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.FashionDesignerDTO;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.entity.FashionDesigner;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.FashionDesignerRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.FashionDesignerService;
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
public class FashionDesignerServiceImpl implements FashionDesignerService {

    private final FashionDesignerRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FashionDesignerDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<FashionDesigner> spec = SearchSpecifications.fashionDesignerSpec(search, filters);
        Page<FashionDesigner> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), FashionDesignerDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FashionDesignerDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<FashionDesigner> records;

        if (!request.isKeyset()) {
            Page<FashionDesigner> firstPage = repository.findAll(
                    SearchSpecifications.fashionDesignerSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), FashionDesignerDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<FashionDesignerDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, FashionDesignerDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public FashionDesignerDTO getById(Long id) {
        FashionDesigner entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FashionDesigner", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public FashionDesignerDTO create(FashionDesignerDTO dto) {
        FashionDesigner entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public FashionDesignerDTO update(Long id, FashionDesignerDTO dto) {
        FashionDesigner entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FashionDesigner", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("FashionDesigner", "id", id);
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
    @Cacheable(value = "filter_options", key = "'fashion_designers'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("designerNames", repository.findDistinctDesignerNames());
        options.put("brandNames", repository.findDistinctBrandNames());
        options.put("cities", repository.findDistinctCities());
        options.put("states", repository.findDistinctStates());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("fashion_designers", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<FashionDesigner> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            FashionDesigner entity = FashionDesigner.builder()
                    .designerName(getString(row, "Designer_Name", "designerName", "designer_name", "Designer Name"))
                    .brandName(getString(row, "Brand_Name", "brandName", "brand_name", "Brand Name"))
                    .specification(getString(row, "Specification", "specification"))
                    .city(getString(row, "City", "city"))
                    .state(getString(row, "State", "state"))
                    .country(getString(row, "Country", "country"))
                    .websiteAddress(getString(row, "Website_Address", "websiteAddress", "website_address", "Website Address", "website"))
                    .officialEmail(getString(row, "Official_Email", "officialEmail", "official_email", "Official Email", "email"))
                    .mobileNumber(getString(row, "Mobile_Number", "mobileNumber", "mobile_number", "Mobile Number", "phone"))
                    .pincode(getString(row, "Pincode", "pincode", "Pin"))
                    .studioAddress(getString(row, "Studio_Address", "studioAddress", "studio_address", "Studio Address", "address"))
                    .yearOfEstablishment(getString(row, "Year_of_Establishment", "yearOfEstablishment", "year_of_establishment", "year"))
                    .verificationStatus(getString(row, "Mobile/website_verification", "verificationStatus", "verification_status", "verification"))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<FashionDesigner> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<FashionDesigner> spec = SearchSpecifications.fashionDesignerSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (FashionDesigner d : records) {
            dataRows.add(toMap(d));
        }

        return excelService.exportToExcel("fashion_designers", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("fashion_designers", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<FashionDesigner> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (FashionDesigner d : chunk) {
                maps.add(toMap(d));
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

    private Map<String, Object> toMap(FashionDesigner d) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", d.getId());
        map.put("designerName", d.getDesignerName());
        map.put("brandName", d.getBrandName());
        map.put("specification", d.getSpecification());
        map.put("city", d.getCity());
        map.put("state", d.getState());
        map.put("country", d.getCountry());
        map.put("websiteAddress", d.getWebsiteAddress());
        map.put("officialEmail", d.getOfficialEmail());
        map.put("mobileNumber", d.getMobileNumber());
        map.put("pincode", d.getPincode());
        map.put("studioAddress", d.getStudioAddress());
        map.put("yearOfEstablishment", d.getYearOfEstablishment());
        map.put("verificationStatus", d.getVerificationStatus());
        return map;
    }
}

