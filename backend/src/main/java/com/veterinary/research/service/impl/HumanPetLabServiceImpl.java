package com.veterinary.research.service.impl;

import com.veterinary.research.dto.CursorPageRequest;
import com.veterinary.research.dto.ExcelDTOs;
import com.veterinary.research.dto.HumanPetLabDTO;
import com.veterinary.research.dto.PageResponse;
import com.veterinary.research.entity.HumanPetLab;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.exception.ResourceNotFoundException;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.mapper.EntityDtoMapper;
import com.veterinary.research.repository.HumanPetLabRepository;
import com.veterinary.research.repository.spec.SearchSpecifications;
import com.veterinary.research.service.HumanPetLabService;
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
public class HumanPetLabServiceImpl implements HumanPetLabService {

    private final HumanPetLabRepository repository;
    private final EntityDtoMapper mapper;
    private final ExcelService excelService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<HumanPetLabDTO> getAll(String search, Map<String, String> filters, Pageable pageable) {
        Specification<HumanPetLab> spec = SearchSpecifications.humanPetLabSpec(search, filters);
        Page<HumanPetLab> page = repository.findAll(spec, pageable);
        return PageResponse.from(page.map(mapper::toDTO), HumanPetLabDTO::getId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<HumanPetLabDTO> getByCursor(CursorPageRequest request) {
        int size = Math.max(1, Math.min(request.getSize(), 200));
        Pageable pageable = PageRequest.of(0, size);
        List<HumanPetLab> records;

        if (!request.isKeyset()) {
            Page<HumanPetLab> firstPage = repository.findAll(
                    SearchSpecifications.humanPetLabSpec(request.getSearch(), request.getFilters()),
                    PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))
            );
            return PageResponse.from(firstPage.map(mapper::toDTO), HumanPetLabDTO::getId);
        }

        if ("prev".equalsIgnoreCase(request.getDirection())) {
            records = repository.findByIdGreaterThanOrderByIdAsc(request.getCursor(), pageable);
            Collections.reverse(records);
        } else {
            records = repository.findByIdLessThanOrderByIdDesc(request.getCursor(), pageable);
        }

        List<HumanPetLabDTO> dtoList = records.stream().map(mapper::toDTO).toList();
        long count = repository.count();
        boolean hasMore = records.size() >= size;

        return PageResponse.fromCursor(dtoList, size, count, HumanPetLabDTO::getId, hasMore, request.isKeyset());
    }

    @Override
    @Transactional(readOnly = true)
    public HumanPetLabDTO getById(Long id) {
        HumanPetLab entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HumanPetLab", "id", id));
        return mapper.toDTO(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public HumanPetLabDTO create(HumanPetLabDTO dto) {
        HumanPetLab entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public HumanPetLabDTO update(Long id, HumanPetLabDTO dto) {
        HumanPetLab entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HumanPetLab", "id", id));
        mapper.updateEntity(entity, dto);
        return mapper.toDTO(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("HumanPetLab", "id", id);
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
    @Cacheable(value = "filter_options", key = "'human_pet_labs'", unless = "#result == null")
    @Transactional(readOnly = true)
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("laboratoryNames", repository.findDistinctLaboratoryNames());
        options.put("laboratoryTypes", repository.findDistinctLaboratoryTypes());
        options.put("states", repository.findDistinctStates());
        options.put("cities", repository.findDistinctCities());
        return options;
    }

    @Override
    public ExcelDTOs.ExcelPreviewResponse previewExcel(MultipartFile file) throws Exception {
        return excelService.previewExcel("human_pet_labs", file);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"dashboard_stats", "filter_options"}, allEntries = true)
    public int confirmExcelImport(List<Map<String, Object>> validRows) {
        if (validRows == null || validRows.isEmpty()) return 0;
        List<HumanPetLab> entities = new ArrayList<>();

        for (Map<String, Object> row : validRows) {
            HumanPetLab entity = HumanPetLab.builder()
                    .state(getString(row, "State", "state"))
                    .city(getString(row, "City", "city"))
                    .laboratoryName(getString(row, "Laboratory_Name", "laboratoryName", "laboratory_name", "Laboratory Name"))
                    .laboratoryAddress(getString(row, "Laboratory_Address", "laboratoryAddress", "laboratory_address", "Laboratory Address", "address"))
                    .contactNumber(getString(row, "Contact_Number", "contactNumber", "contact_number", "Contact Number", "phone"))
                    .emailId(getString(row, "Email_ID", "emailId", "email_id", "Email ID", "email"))
                    .laboratoryType(getString(row, "Laboratory_Type", "laboratoryType", "laboratory_type", "Laboratory Type", "type"))
                    .testingServices(getString(row, "Testing_Services", "testingServices", "testing_services", "Testing Services", "services"))
                    .animalTypesCovered(getString(row, "Animal_Types_Covered_(N/A_for_Human_Labs)", "animalTypesCovered", "animal_types_covered", "animalTypes"))
                    .website(getString(row, "website", "Website"))
                    .googleMapsLink(getString(row, "Google_Maps_Link", "googleMapsLink", "google_maps_link", "Google Maps Link", "mapsLink"))
                    .build();
            entities.add(entity);
        }

        return repository.saveAll(entities).size();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcel(String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        List<HumanPetLab> records;
        if ("selected".equalsIgnoreCase(scope) && selectedIds != null && !selectedIds.isEmpty()) {
            records = repository.findAllById(selectedIds);
        } else if ("filtered".equalsIgnoreCase(scope)) {
            Specification<HumanPetLab> spec = SearchSpecifications.humanPetLabSpec(search, filters);
            records = repository.findAll(spec, PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        } else {
            records = repository.findAll(PageRequest.of(0, 50000, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }

        List<Map<String, Object>> dataRows = new ArrayList<>(records.size());
        for (HumanPetLab lab : records) {
            dataRows.add(toMap(lab));
        }

        return excelService.exportToExcel("human_pet_labs", dataRows);
    }

    @Override
    public JobInfo exportAsync(String format, String scope, List<Long> selectedIds, String search, Map<String, String> filters) throws Exception {
        long totalCount = repository.count();
        return excelService.startAsyncExport("human_pet_labs", format, (lastId) -> {
            Pageable pageable = PageRequest.of(0, 5000);
            List<HumanPetLab> chunk = repository.findByIdGreaterThanOrderByIdAsc(lastId, pageable);
            List<Map<String, Object>> maps = new ArrayList<>(chunk.size());
            for (HumanPetLab lab : chunk) {
                maps.add(toMap(lab));
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

    private Map<String, Object> toMap(HumanPetLab lab) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", lab.getId());
        map.put("state", lab.getState());
        map.put("city", lab.getCity());
        map.put("laboratoryName", lab.getLaboratoryName());
        map.put("laboratoryAddress", lab.getLaboratoryAddress());
        map.put("contactNumber", lab.getContactNumber());
        map.put("emailId", lab.getEmailId());
        map.put("laboratoryType", lab.getLaboratoryType());
        map.put("testingServices", lab.getTestingServices());
        map.put("animalTypesCovered", lab.getAnimalTypesCovered());
        map.put("website", lab.getWebsite());
        map.put("googleMapsLink", lab.getGoogleMapsLink());
        return map;
    }
}

