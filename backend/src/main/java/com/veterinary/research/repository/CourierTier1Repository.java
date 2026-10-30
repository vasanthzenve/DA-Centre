package com.veterinary.research.repository;

import com.veterinary.research.entity.CourierTier1;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourierTier1Repository extends JpaRepository<CourierTier1, Long>, JpaSpecificationExecutor<CourierTier1> {

    List<CourierTier1> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<CourierTier1> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query(value = "SELECT DISTINCT company_name FROM courier_tier_1 WHERE company_name IS NOT NULL AND company_name <> '' ORDER BY company_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCompanyNames();

    @Query(value = "SELECT DISTINCT city FROM courier_tier_1 WHERE city IS NOT NULL AND city <> '' ORDER BY city ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCities();

    @Query(value = "SELECT DISTINCT state FROM courier_tier_1 WHERE state IS NOT NULL AND state <> '' ORDER BY state ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStates();
}

