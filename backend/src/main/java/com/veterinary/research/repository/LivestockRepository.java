package com.veterinary.research.repository;

import com.veterinary.research.entity.Livestock;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LivestockRepository extends JpaRepository<Livestock, Long>, JpaSpecificationExecutor<Livestock> {

    List<Livestock> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<Livestock> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query(value = "SELECT DISTINCT name FROM livestock WHERE name IS NOT NULL AND name <> '' ORDER BY name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctNames();

    @Query(value = "SELECT DISTINCT livestock_type FROM livestock WHERE livestock_type IS NOT NULL AND livestock_type <> '' ORDER BY livestock_type ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctLivestockTypes();

    @Query(value = "SELECT DISTINCT farm_type FROM livestock WHERE farm_type IS NOT NULL AND farm_type <> '' ORDER BY farm_type ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctFarmTypes();

    @Query(value = "SELECT DISTINCT state FROM livestock WHERE state IS NOT NULL AND state <> '' ORDER BY state ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStates();

    @Query(value = "SELECT DISTINCT district FROM livestock WHERE district IS NOT NULL AND district <> '' ORDER BY district ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctDistricts();

    @Query(value = "SELECT DISTINCT business_status FROM livestock WHERE business_status IS NOT NULL AND business_status <> '' ORDER BY business_status ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctBusinessStatuses();
}

