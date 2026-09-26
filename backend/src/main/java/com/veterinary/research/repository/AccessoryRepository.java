package com.veterinary.research.repository;

import com.veterinary.research.entity.Accessory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccessoryRepository extends JpaRepository<Accessory, Long>, JpaSpecificationExecutor<Accessory> {

    // Keyset / Cursor Pagination Methods (O(1) seek for 15M records)
    List<Accessory> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<Accessory> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query(value = "SELECT DISTINCT business_name FROM accessories WHERE business_name IS NOT NULL AND business_name <> '' ORDER BY business_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctBusinessNames();

    @Query(value = "SELECT DISTINCT category FROM accessories WHERE category IS NOT NULL AND category <> '' ORDER BY category ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCategories();

    @Query(value = "SELECT DISTINCT sub_category FROM accessories WHERE sub_category IS NOT NULL AND sub_category <> '' ORDER BY sub_category ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctSubCategories();

    @Query(value = "SELECT DISTINCT pet_type FROM accessories WHERE pet_type IS NOT NULL AND pet_type <> '' ORDER BY pet_type ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctPetTypes();

    @Query(value = "SELECT DISTINCT availability FROM accessories WHERE availability IS NOT NULL AND availability <> '' ORDER BY availability ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctAvailabilities();
}
