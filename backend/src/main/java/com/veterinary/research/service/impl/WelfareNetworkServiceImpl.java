package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.dto.WelfareNetworkDTO;
import com.veterinary.research.entity.WelfareNetwork;
import com.veterinary.research.excel.ExcelHelper;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.WelfareNetworkRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.WelfareNetworkService;
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
public class WelfareNetworkServiceImpl implements WelfareNetworkService {

    private final WelfareNetworkRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WelfareNetworkDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<WelfareNetwork> spec = SearchSpecifications.welfareNetworkSpec(search, filters);
        Page<WelfareNetwork> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), WelfareNetworkDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WelfareNetworkDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<WelfareNetwork> records;

        if (!request.isKeyset()) {
            Page<WelfareNetwork> firstPage = repository.findAll(
                    SearchSpecifications.welfareNetworkSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), WelfareNetworkDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<WelfareNetworkDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, WelfareNetworkDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public WelfareNetworkDTO getById(Long id) {
        WelfareNetwork entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WelfareNetwork", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public WelfareNetworkDTO create(WelfareNetworkDTO dto) {
        WelfareNetwork entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public WelfareNetworkDTO update(Long id, WelfareNetworkDTO dto) {
        WelfareNetwork entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WelfareNetwork", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("WelfareNetwork", "id", id);
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
    @Cacheable(value = "filter_options", key = "'welfare_network'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("businessNames", repository.findDistinctBusinessNames());
        options.put("serviceTypes", repository.findDistinctServiceTypes());
        options.put("states", repository.findDistinctStates());
        options.put("districtRegions", repository.findDistinctDistrictRegions());
        options.put("areas", repository.findDistinctAreas());
        options.put("cityRegions", repository.findDistinctCityRegions());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("welfare_network", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<WelfareNetwork> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            WelfareNetwork entity = WelfareNetwork.builder()
                    .businessName((String) (row.get("Business Name") != null ? row.get("Business Name") : row.get("businessName")))
                    .serviceType((String) (row.get("Service Type") != null ? row.get("Service Type") : row.get("serviceType")))
                    .state((String) (row.get("State") != null ? row.get("State") : row.get("state")))
                    .districtRegion((String) (row.get("District / Region") != null ? row.get("District / Region") : row.get("districtRegion")))
                    .area((String) (row.get("Area") != null ? row.get("Area") : row.get("area")))
                    .address((String) (row.get("Address") != null ? row.get("Address") : row.get("address")))
                    .cityRegion((String) (row.get("City / Region") != null ? row.get("City / Region") : row.get("cityRegion")))
                    .contactNumber((String) (row.get("Contact Number") != null ? row.get("Contact Number") : row.get("contactNumber")))
                    .websiteSocialMedia((String) (row.get("Website / Social Media") != null ? row.get("Website / Social Media") : row.get("websiteSocialMedia")))
                    .rating(ExcelHelper.parseBigDecimal(row.get("Rating") != null ? row.get("Rating") : row.get("rating")))
                    .googleMapsSourceUrl((String) (row.get("Google Maps / Source URL") != null ? row.get("Google Maps / Source URL") : row.get("googleMapsSourceUrl")))
                    .bookingUrlContact((String) (row.get("Booking URL / Booking Contact") != null ? row.get("Booking URL / Booking Contact") : row.get("bookingUrlContact")))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<WelfareNetwork> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<WelfareNetwork> spec = SearchSpecifications.welfareNetworkSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (WelfareNetwork w : records) {
            dataRows.add(toMap(w));
        }

        return excelService.exportToExcel("welfare_network", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("welfare_network", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<WelfareNetwork> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (WelfareNetwork w : chunk) {
                maps.add(toMap(w));
            }
            return maps;
        }, totalCount);
    }

    private Map<String, Object> toMap(WelfareNetwork w) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", w.getId());
        map.put("businessName", w.getBusinessName());
        map.put("serviceType", w.getServiceType());
        map.put("state", w.getState());
        map.put("districtRegion", w.getDistrictRegion());
        map.put("area", w.getArea());
        map.put("address", w.getAddress());
        map.put("cityRegion", w.getCityRegion());
        map.put("contactNumber", w.getContactNumber());
        map.put("websiteSocialMedia", w.getWebsiteSocialMedia());
        map.put("rating", w.getRating());
        map.put("googleMapsSourceUrl", w.getGoogleMapsSourceUrl());
        map.put("bookingUrlContact", w.getBookingUrlContact());
        return map;
    }
}
