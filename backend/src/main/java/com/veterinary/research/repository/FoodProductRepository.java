package com.veterinary.research.repository;

import com.veterinary.research.entity.FoodProduct;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodProductRepository extends JpaRepository<FoodProduct, Long>, JpaSpecificationExecutor<FoodProduct> {

    // Keyset / Cursor Pagination Methods (O(1) seek for 15M records)
    List<FoodProduct> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<FoodProduct> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query(value = "SELECT DISTINCT brand_name FROM food_products WHERE brand_name IS NOT NULL AND brand_name <> '' ORDER BY brand_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctBrands();

    @Query(value = "SELECT DISTINCT product_category FROM food_products WHERE product_category IS NOT NULL AND product_category <> '' ORDER BY product_category ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCategories();

    @Query(value = "SELECT DISTINCT sub_category FROM food_products WHERE sub_category IS NOT NULL AND sub_category <> '' ORDER BY sub_category ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctSubCategories();

    @Query(value = "SELECT DISTINCT pet_type FROM food_products WHERE pet_type IS NOT NULL AND pet_type <> '' ORDER BY pet_type ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctPetTypes();

    @Query(value = "SELECT DISTINCT life_stage FROM food_products WHERE life_stage IS NOT NULL AND life_stage <> '' ORDER BY life_stage ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctLifeStages();

    @Query(value = "SELECT DISTINCT breed_size FROM food_products WHERE breed_size IS NOT NULL AND breed_size <> '' ORDER BY breed_size ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctBreedSizes();

    @Query(value = "SELECT DISTINCT dietary_type FROM food_products WHERE dietary_type IS NOT NULL AND dietary_type <> '' ORDER BY dietary_type ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctDietaryTypes();

    @Query(value = "SELECT DISTINCT formulation FROM food_products WHERE formulation IS NOT NULL AND formulation <> '' ORDER BY formulation ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctFormulations();

    @Query(value = "SELECT DISTINCT manufacturer FROM food_products WHERE manufacturer IS NOT NULL AND manufacturer <> '' ORDER BY manufacturer ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctManufacturers();

    @Query(value = "SELECT DISTINCT availability FROM food_products WHERE availability IS NOT NULL AND availability <> '' ORDER BY availability ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctAvailabilities();
}
