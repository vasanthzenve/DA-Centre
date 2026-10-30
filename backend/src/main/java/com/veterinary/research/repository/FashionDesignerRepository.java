package com.veterinary.research.repository;

import com.veterinary.research.entity.FashionDesigner;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FashionDesignerRepository extends JpaRepository<FashionDesigner, Long>, JpaSpecificationExecutor<FashionDesigner> {

    List<FashionDesigner> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<FashionDesigner> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query(value = "SELECT DISTINCT designer_name FROM fashion_designers WHERE designer_name IS NOT NULL AND designer_name <> '' ORDER BY designer_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctDesignerNames();

    @Query(value = "SELECT DISTINCT brand_name FROM fashion_designers WHERE brand_name IS NOT NULL AND brand_name <> '' ORDER BY brand_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctBrandNames();

    @Query(value = "SELECT DISTINCT city FROM fashion_designers WHERE city IS NOT NULL AND city <> '' ORDER BY city ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCities();

    @Query(value = "SELECT DISTINCT state FROM fashion_designers WHERE state IS NOT NULL AND state <> '' ORDER BY state ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStates();
}

