package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.dto.ServiceNetworkDTO;
import com.veterinary.research.entity.ServiceNetwork;
import com.veterinary.research.excel.ExcelHelper;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.ServiceNetworkRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.ServiceNetworkService;
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
public class ServiceNetworkServiceImpl implements ServiceNetworkService {

    private final ServiceNetworkRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ServiceNetworkDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<ServiceNetwork> spec = SearchSpecifications.serviceNetworkSpec(search, filters);
        Page<ServiceNetwork> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), ServiceNetworkDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ServiceNetworkDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<ServiceNetwork> records;

        if (!request.isKeyset()) {
            Page<ServiceNetwork> firstPage = repository.findAll(
                    SearchSpecifications.serviceNetworkSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), ServiceNetworkDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<ServiceNetworkDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, ServiceNetworkDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceNetworkDTO getById(Long id) {
        ServiceNetwork entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceNetwork", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public ServiceNetworkDTO create(ServiceNetworkDTO dto) {
        ServiceNetwork entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public ServiceNetworkDTO update(Long id, ServiceNetworkDTO dto) {
        ServiceNetwork entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceNetwork", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("ServiceNetwork", "id", id);
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
    @Cacheable(value = "filter_options", key = "'service_network'", unless = "#result == null")
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
        return excelService.previewExcel("service_network", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<ServiceNetwork> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            ServiceNetwork entity = ServiceNetwork.builder()
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
        List<ServiceNetwork> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<ServiceNetwork> spec = SearchSpecifications.serviceNetworkSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (ServiceNetwork s : records) {
            dataRows.add(toMap(s));
        }

        return excelService.exportToExcel("service_network", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("service_network", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<ServiceNetwork> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (ServiceNetwork s : chunk) {
                maps.add(toMap(s));
            }
            return maps;
        }, totalCount);
    }

    private Map<String, Object> toMap(ServiceNetwork s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", s.getId());
        map.put("businessName", s.getBusinessName());
        map.put("serviceType", s.getServiceType());
        map.put("state", s.getState());
        map.put("districtRegion", s.getDistrictRegion());
        map.put("area", s.getArea());
        map.put("address", s.getAddress());
        map.put("cityRegion", s.getCityRegion());
        map.put("contactNumber", s.getContactNumber());
        map.put("websiteSocialMedia", s.getWebsiteSocialMedia());
        map.put("rating", s.getRating());
        map.put("googleMapsSourceUrl", s.getGoogleMapsSourceUrl());
        map.put("bookingUrlContact", s.getBookingUrlContact());
        return map;
    }
}
