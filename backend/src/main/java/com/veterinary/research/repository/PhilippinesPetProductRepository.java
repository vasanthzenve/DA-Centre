package com.veterinary.research.repository;

import com.veterinary.research.entity.PhilippinesPetProduct;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhilippinesPetProductRepository extends JpaRepository<PhilippinesPetProduct, Long>, JpaSpecificationExecutor<PhilippinesPetProduct> {

    List<PhilippinesPetProduct> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<PhilippinesPetProduct> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query(value = "SELECT DISTINCT product_name FROM philippines_pet_products WHERE product_name IS NOT NULL AND product_name <> '' ORDER BY product_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctProductNames();

    @Query(value = "SELECT DISTINCT brand_name FROM philippines_pet_products WHERE brand_name IS NOT NULL AND brand_name <> '' ORDER BY brand_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctBrandNames();

    @Query(value = "SELECT DISTINCT marketplace_name FROM philippines_pet_products WHERE marketplace_name IS NOT NULL AND marketplace_name <> '' ORDER BY marketplace_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctMarketplaceNames();

    @Query(value = "SELECT DISTINCT availability FROM philippines_pet_products WHERE availability IS NOT NULL AND availability <> '' ORDER BY availability ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctAvailabilities();

    @Query(value = "SELECT DISTINCT country FROM philippines_pet_products WHERE country IS NOT NULL AND country <> '' ORDER BY country ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCountries();
}

