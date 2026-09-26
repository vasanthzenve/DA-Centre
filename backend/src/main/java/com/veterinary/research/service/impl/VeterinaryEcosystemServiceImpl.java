
package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.dto.VeterinaryEcosystemDTO;
import com.veterinary.research.entity.VeterinaryEcosystem;
import com.veterinary.research.excel.ExcelHelper;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.VeterinaryEcosystemRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.VeterinaryEcosystemService;
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
public class VeterinaryEcosystemServiceImpl implements VeterinaryEcosystemService {

    private final VeterinaryEcosystemRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VeterinaryEcosystemDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<VeterinaryEcosystem> spec = SearchSpecifications.veterinaryEcosystemSpec(search, filters);
        Page<VeterinaryEcosystem> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), VeterinaryEcosystemDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VeterinaryEcosystemDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<VeterinaryEcosystem> records;

        if (!request.isKeyset()) {
            Page<VeterinaryEcosystem> firstPage = repository.findAll(
                    SearchSpecifications.veterinaryEcosystemSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id")));
            return PageResponse.from(firstPage.map(mapper::toDTO), VeterinaryEcosystemDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<VeterinaryEcosystemDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, VeterinaryEcosystemDTO::getId, hasMore,
                request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public VeterinaryEcosystemDTO getById(Long id) {
        VeterinaryEcosystem entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VeterinaryEcosystem", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "dashboard_stats", "filter_options" }, allEntries = true)
    public VeterinaryEcosystemDTO create(VeterinaryEcosystemDTO dto) {
        VeterinaryEcosystem entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = { "dashboard_stats", "filter_options" }, allEntries = true)
    public VeterinaryEcosystemDTO update(Long id, VeterinaryEcosystemDTO dto) {
        VeterinaryEcosystem entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VeterinaryEcosystem", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = { "dashboard_stats", "filter_options" }, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("VeterinaryEcosystem", "id", id);
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "dashboard_stats", "filter_options" }, allEntries = true)
    public void bulkDelete(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            repository.deleteAllById(ids);
        }
    }

    @Override
    @Cacheable(value = "filter_options", key = "'veterinary_ecosystem'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("states", repository.findDistinctStates());
        options.put("cities", repository.findDistinctCities());
        options.put("areas", repository.findDistinctAreas());
        options.put("businessStatuses", repository.findDistinctBusinessStatuses());
        options.put("services", repository.findDistinctServices());
        options.put("onlineVerifications", repository.findDistinctOnlineVerifications());
        options.put("analysts", repository.findDistinctAnalysts());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("veterinary_ecosystem", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "dashboard_stats", "filter_options" }, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty())
            return 0;
        List<VeterinaryEcosystem> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            VeterinaryEcosystem entity = VeterinaryEcosystem.builder()
                    .state((String) (row.get("State") != null ? row.get("State") : row.get("state")))
                    .city((String) (row.get("City") != null ? row.get("City") : row.get("city")))
                    .area((String) (row.get("Area") != null ? row.get("Area") : row.get("area")))
                    .hospitalName((String) (row.get("Hospital Name") != null ? row.get("Hospital Name")
                            : row.get("hospitalName")))
                    .address((String) (row.get("Address") != null ? row.get("Address") : row.get("address")))
                    .phoneNumber((String) (row.get("Phone Number") != null ? row.get("Phone Number")
                            : row.get("phoneNumber")))
                    .website((String) (row.get("Website") != null ? row.get("Website") : row.get("website")))
                    .openingHours((String) (row.get("Opening Hours") != null ? row.get("Opening Hours")
                            : row.get("openingHours")))
                    .rating(ExcelHelper
                            .parseBigDecimal(row.get("Rating") != null ? row.get("Rating") : row.get("rating")))
                    .reviews(ExcelHelper
                            .parseInteger(row.get("Reviews") != null ? row.get("Reviews") : row.get("reviews")))
                    .businessStatus((String) (row.get("Business Status") != null ? row.get("Business Status")
                            : row.get("businessStatus")))
                    .googleMaps(
                            (String) (row.get("Google Maps") != null ? row.get("Google Maps") : row.get("googleMaps")))
                    .placeId((String) (row.get("Place ID") != null ? row.get("Place ID") : row.get("placeId")))
                    .service((String) (row.get("Service") != null ? row.get("Service") : row.get("service")))
                    .onlineVerification(
                            (String) (row.get("Online Verification") != null ? row.get("Online Verification")
                                    : row.get("onlineVerification")))
                    .comment((String) (row.get("Comment") != null ? row.get("Comment") : row.get("comment")))
                    .fashionSupply((String) (row.get("Fashion supply") != null ? row.get("Fashion supply")
                            : row.get("fashionSupply")))
                    .analyst((String) (row.get("Analyst") != null ? row.get("Analyst") : row.get("analyst")))
                    .date(ExcelHelper.parseLocalDate(row.get("Date") != null ? row.get("Date") : row.get("date")))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters)
            throws Exception {
        List<VeterinaryEcosystem> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<VeterinaryEcosystem> spec = SearchSpecifications.veterinaryEcosystemSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id")))
                    .getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (VeterinaryEcosystem ve : records) {
            dataRows.add(toMap(ve));
        }

        return excelService.exportToExcel("veterinary_ecosystem", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search,
            Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("veterinary_ecosystem", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<VeterinaryEcosystem> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (VeterinaryEcosystem ve : chunk) {
                maps.add(toMap(ve));
            }
            return maps;
        }, totalCount);
    }

    private Map<String, Object> toMap(VeterinaryEcosystem ve) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", ve.getId());
        map.put("state", ve.getState());
        map.put("city", ve.getCity());
        map.put("area", ve.getArea());
        map.put("hospitalName", ve.getHospitalName());
        map.put("address", ve.getAddress());
        map.put("phoneNumber", ve.getPhoneNumber());
        map.put("website", ve.getWebsite());
        map.put("openingHours", ve.getOpeningHours());
        map.put("rating", ve.getRating());
        map.put("reviews", ve.getReviews());
        map.put("businessStatus", ve.getBusinessStatus());
        map.put("googleMaps", ve.getGoogleMaps());
        map.put("placeId", ve.getPlaceId());
        map.put("service", ve.getService());
        map.put("onlineVerification", ve.getOnlineVerification());
        map.put("comment", ve.getComment());
        map.put("fashionSupply", ve.getFashionSupply());
        map.put("analyst", ve.getAnalyst());
        map.put("date", ve.getDate());
        return map;
    }
}
