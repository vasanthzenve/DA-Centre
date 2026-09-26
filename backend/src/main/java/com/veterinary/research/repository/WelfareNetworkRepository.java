package com.veterinary.research.repository;

import com.veterinary.research.entity.WelfareNetwork;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface WelfareNetworkRepository extends JpaRepository<WelfareNetwork, Long>, JpaSpecificationExecutor<WelfareNetwork> {

    // Keyset / Cursor Pagination Methods (O(1) seek for 15M records)
    List<WelfareNetwork> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<WelfareNetwork> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query("SELECT w.state as state, COUNT(w) as count FROM WelfareNetwork w WHERE w.state IS NOT NULL AND w.state <> '' GROUP BY w.state ORDER BY count DESC")
    List<Map<String, Object>> countByStateGroup();

    @Query(value = "SELECT DISTINCT business_name FROM welfare_network WHERE business_name IS NOT NULL AND business_name <> '' ORDER BY business_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctBusinessNames();

    @Query(value = "SELECT DISTINCT service_type FROM welfare_network WHERE service_type IS NOT NULL AND service_type <> '' ORDER BY service_type ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctServiceTypes();

    @Query(value = "SELECT DISTINCT state FROM welfare_network WHERE state IS NOT NULL AND state <> '' ORDER BY state ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStates();

    @Query(value = "SELECT DISTINCT district_region FROM welfare_network WHERE district_region IS NOT NULL AND district_region <> '' ORDER BY district_region ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctDistrictRegions();

    @Query(value = "SELECT DISTINCT area FROM welfare_network WHERE area IS NOT NULL AND area <> '' ORDER BY area ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctAreas();

    @Query(value = "SELECT DISTINCT city_region FROM welfare_network WHERE city_region IS NOT NULL AND city_region <> '' ORDER BY city_region ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCityRegions();
}
