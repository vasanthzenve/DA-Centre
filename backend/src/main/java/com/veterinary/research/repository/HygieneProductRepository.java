package com.veterinary.research.repository;

import com.veterinary.research.entity.HygieneProduct;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HygieneProductRepository extends JpaRepository<HygieneProduct, Long>, JpaSpecificationExecutor<HygieneProduct> {

    // Keyset / Cursor Pagination Methods (O(1) seek for 15M records)
    List<HygieneProduct> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<HygieneProduct> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query(value = "SELECT DISTINCT brand_name FROM hygiene_products WHERE brand_name IS NOT NULL AND brand_name <> '' ORDER BY brand_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctBrands();

    @Query(value = "SELECT DISTINCT product_category FROM hygiene_products WHERE product_category IS NOT NULL AND product_category <> '' ORDER BY product_category ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCategories();

    @Query(value = "SELECT DISTINCT sub_category FROM hygiene_products WHERE sub_category IS NOT NULL AND sub_category <> '' ORDER BY sub_category ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctSubCategories();

    @Query(value = "SELECT DISTINCT pet_type FROM hygiene_products WHERE pet_type IS NOT NULL AND pet_type <> '' ORDER BY pet_type ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctPetTypes();

    @Query(value = "SELECT DISTINCT formulation FROM hygiene_products WHERE formulation IS NOT NULL AND formulation <> '' ORDER BY formulation ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctFormulations();

    @Query(value = "SELECT DISTINCT manufacturer FROM hygiene_products WHERE manufacturer IS NOT NULL AND manufacturer <> '' ORDER BY manufacturer ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctManufacturers();

    @Query(value = "SELECT DISTINCT availability FROM hygiene_products WHERE availability IS NOT NULL AND availability <> '' ORDER BY availability ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctAvailabilities();

    @Query(value = "SELECT DISTINCT status FROM hygiene_products WHERE status IS NOT NULL AND status <> '' ORDER BY status ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStatuses();
}
