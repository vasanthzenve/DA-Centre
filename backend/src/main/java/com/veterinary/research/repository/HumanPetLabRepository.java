package com.veterinary.research.repository;

import com.veterinary.research.entity.HumanPetLab;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HumanPetLabRepository extends JpaRepository<HumanPetLab, Long>, JpaSpecificationExecutor<HumanPetLab> {

    List<HumanPetLab> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<HumanPetLab> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query(value = "SELECT DISTINCT laboratory_name FROM human_pet_labs WHERE laboratory_name IS NOT NULL AND laboratory_name <> '' ORDER BY laboratory_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctLaboratoryNames();

    @Query(value = "SELECT DISTINCT laboratory_type FROM human_pet_labs WHERE laboratory_type IS NOT NULL AND laboratory_type <> '' ORDER BY laboratory_type ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctLaboratoryTypes();

    @Query(value = "SELECT DISTINCT state FROM human_pet_labs WHERE state IS NOT NULL AND state <> '' ORDER BY state ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStates();

    @Query(value = "SELECT DISTINCT city FROM human_pet_labs WHERE city IS NOT NULL AND city <> '' ORDER BY city ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCities();
}

