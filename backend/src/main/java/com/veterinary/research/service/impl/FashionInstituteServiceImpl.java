package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.FashionInstituteDTO;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.entity.FashionInstitute;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.FashionInstituteRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.FashionInstituteService;
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
public class FashionInstituteServiceImpl implements FashionInstituteService {

    private final FashionInstituteRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FashionInstituteDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<FashionInstitute> spec = SearchSpecifications.fashionInstituteSpec(search, filters);
        Page<FashionInstitute> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), FashionInstituteDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FashionInstituteDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<FashionInstitute> records;

        if (!request.isKeyset()) {
            Page<FashionInstitute> firstPage = repository.findAll(
                    SearchSpecifications.fashionInstituteSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), FashionInstituteDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<FashionInstituteDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, FashionInstituteDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public FashionInstituteDTO getById(Long id) {
        FashionInstitute entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FashionInstitute", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public FashionInstituteDTO create(FashionInstituteDTO dto) {
        FashionInstitute entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public FashionInstituteDTO update(Long id, FashionInstituteDTO dto) {
        FashionInstitute entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FashionInstitute", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("FashionInstitute", "id", id);
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
    @Cacheable(value = "filter_options", key = "'fashion_institutes'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("instituteNames", repository.findDistinctInstituteNames());
        options.put("cities", repository.findDistinctCities());
        options.put("states", repository.findDistinctStates());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("fashion_institutes", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<FashionInstitute> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            FashionInstitute entity = FashionInstitute.builder()
                    .state(getString(row, "state", "State"))
                    .city(getString(row, "City", "city"))
                    .area(getString(row, "Area", "area"))
                    .instituteName(getString(row, "Institute_Name", "instituteName", "institute_name", "Institute Name"))
                    .address(getString(row, "Address", "address"))
                    .pincode(getString(row, "Pincode", "pincode", "Pin"))
                    .phoneNo(getString(row, "Phone_No", "phoneNo", "phone_no", "Phone No", "phone"))
                    .website(getString(row, "Website", "website"))
                    .emailId(getString(row, "Email_ID", "emailId", "email_id", "Email ID", "email"))
                    .mapLocation(getString(row, "Map_Location", "mapLocation", "map_location", "Map Location"))
                    .placeId(getString(row, "Place_ID", "placeId", "place_id", "Place ID"))
                    .verificationStatus(getString(row, "Verification_status", "verificationStatus", "verification_status", "verification"))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<FashionInstitute> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<FashionInstitute> spec = SearchSpecifications.fashionInstituteSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (FashionInstitute i : records) {
            dataRows.add(toMap(i));
        }

        return excelService.exportToExcel("fashion_institutes", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("fashion_institutes", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<FashionInstitute> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (FashionInstitute i : chunk) {
                maps.add(toMap(i));
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

    private Map<String, Object> toMap(FashionInstitute i) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", i.getId());
        map.put("state", i.getState());
        map.put("city", i.getCity());
        map.put("area", i.getArea());
        map.put("instituteName", i.getInstituteName());
        map.put("address", i.getAddress());
        map.put("pincode", i.getPincode());
        map.put("phoneNo", i.getPhoneNo());
        map.put("website", i.getWebsite());
        map.put("emailId", i.getEmailId());
        map.put("mapLocation", i.getMapLocation());
        map.put("placeId", i.getPlaceId());
        map.put("verificationStatus", i.getVerificationStatus());
        return map;
    }
}

