package com.veterinary.research.repository;

import com.veterinary.research.entity.PetManufacturer;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetManufacturerRepository extends JpaRepository<PetManufacturer, Long>, JpaSpecificationExecutor<PetManufacturer> {

    List<PetManufacturer> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<PetManufacturer> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query(value = "SELECT DISTINCT manufacturer_name FROM pet_manufacturers WHERE manufacturer_name IS NOT NULL AND manufacturer_name <> '' ORDER BY manufacturer_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctManufacturerNames();

    @Query(value = "SELECT DISTINCT product_category FROM pet_manufacturers WHERE product_category IS NOT NULL AND product_category <> '' ORDER BY product_category ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctProductCategories();

    @Query(value = "SELECT DISTINCT country FROM pet_manufacturers WHERE country IS NOT NULL AND country <> '' ORDER BY country ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCountries();
}

