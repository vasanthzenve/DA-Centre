package com.veterinary.research.repository;

import com.veterinary.research.entity.Poultry;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoultryRepository extends JpaRepository<Poultry, Long>, JpaSpecificationExecutor<Poultry> {

    List<Poultry> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<Poultry> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query(value = "SELECT DISTINCT name FROM poultry WHERE name IS NOT NULL AND name <> '' ORDER BY name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctNames();

    @Query(value = "SELECT DISTINCT category FROM poultry WHERE category IS NOT NULL AND category <> '' ORDER BY category ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCategories();

    @Query(value = "SELECT DISTINCT sub_category FROM poultry WHERE sub_category IS NOT NULL AND sub_category <> '' ORDER BY sub_category ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctSubCategories();

    @Query(value = "SELECT DISTINCT state FROM poultry WHERE state IS NOT NULL AND state <> '' ORDER BY state ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStates();

    @Query(value = "SELECT DISTINCT district FROM poultry WHERE district IS NOT NULL AND district <> '' ORDER BY district ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctDistricts();

    @Query(value = "SELECT DISTINCT status FROM poultry WHERE status IS NOT NULL AND status <> '' ORDER BY status ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStatuses();
}

