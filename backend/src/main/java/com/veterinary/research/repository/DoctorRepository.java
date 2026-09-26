package com.veterinary.research.repository;

import com.veterinary.research.entity.Doctor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long>, JpaSpecificationExecutor<Doctor> {

    // Keyset / Cursor Pagination Methods (O(1) seek for 15M records)
    List<Doctor> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<Doctor> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query("SELECT d.specialist as specialist, COUNT(d) as count FROM Doctor d WHERE d.specialist IS NOT NULL AND d.specialist <> '' GROUP BY d.specialist ORDER BY count DESC")
    List<Map<String, Object>> countBySpecialistGroup();

    @Query(value = "SELECT DISTINCT doctor_name FROM doctors WHERE doctor_name IS NOT NULL AND doctor_name <> '' ORDER BY doctor_name ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctDoctorNames();

    @Query(value = "SELECT DISTINCT qualification FROM doctors WHERE qualification IS NOT NULL AND qualification <> '' ORDER BY qualification ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctQualifications();

    @Query(value = "SELECT DISTINCT specialist FROM doctors WHERE specialist IS NOT NULL AND specialist <> '' ORDER BY specialist ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctSpecialists();

    @Query(value = "SELECT DISTINCT experience FROM doctors WHERE experience IS NOT NULL AND experience <> '' ORDER BY experience ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctExperiences();

    @Query(value = "SELECT DISTINCT location FROM doctors WHERE location IS NOT NULL AND location <> '' ORDER BY location ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctLocations();

    @Query(value = "SELECT DISTINCT hospital FROM doctors WHERE hospital IS NOT NULL AND hospital <> '' ORDER BY hospital ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctHospitals();
}
