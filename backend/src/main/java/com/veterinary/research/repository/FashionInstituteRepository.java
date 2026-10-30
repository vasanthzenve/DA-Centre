package com.veterinary.research.repository;

import com.veterinary.research.entity.FashionInstitute;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FashionInstituteRepository extends JpaRepository<FashionInstitute, Long>, JpaSpecificationExecutor<FashionInstitute> {

    List<FashionInstitute> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<FashionInstitute> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query(value = "SELECT DISTINCT institute_name FROM fashion_institutes WHERE institute_name IS NOT NULL AND institute_name <> '' ORDER BY institute_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctInstituteNames();

    @Query(value = "SELECT DISTINCT city FROM fashion_institutes WHERE city IS NOT NULL AND city <> '' ORDER BY city ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCities();

    @Query(value = "SELECT DISTINCT state FROM fashion_institutes WHERE state IS NOT NULL AND state <> '' ORDER BY state ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStates();
}

