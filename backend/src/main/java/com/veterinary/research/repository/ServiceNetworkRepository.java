package com.veterinary.research.repository;

import com.veterinary.research.entity.ServiceNetwork;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ServiceNetworkRepository extends JpaRepository<ServiceNetwork, Long>, JpaSpecificationExecutor<ServiceNetwork> {

    // Keyset / Cursor Pagination Methods (O(1) seek for 15M records)
    List<ServiceNetwork> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<ServiceNetwork> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query("SELECT s.districtRegion as region, COUNT(s) as count FROM ServiceNetwork s WHERE s.districtRegion IS NOT NULL AND s.districtRegion <> '' GROUP BY s.districtRegion ORDER BY count DESC")
    List<Map<String, Object>> countByRegionGroup();

    @Query(value = "SELECT DISTINCT business_name FROM service_network WHERE business_name IS NOT NULL AND business_name <> '' ORDER BY business_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctBusinessNames();

    @Query(value = "SELECT DISTINCT service_type FROM service_network WHERE service_type IS NOT NULL AND service_type <> '' ORDER BY service_type ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctServiceTypes();

    @Query(value = "SELECT DISTINCT state FROM service_network WHERE state IS NOT NULL AND state <> '' ORDER BY state ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStates();

    @Query(value = "SELECT DISTINCT district_region FROM service_network WHERE district_region IS NOT NULL AND district_region <> '' ORDER BY district_region ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctDistrictRegions();

    @Query(value = "SELECT DISTINCT area FROM service_network WHERE area IS NOT NULL AND area <> '' ORDER BY area ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctAreas();

    @Query(value = "SELECT DISTINCT city_region FROM service_network WHERE city_region IS NOT NULL AND city_region <> '' ORDER BY city_region ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCityRegions();
}
