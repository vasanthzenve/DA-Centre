package com.veterinary.research.repository;

import com.veterinary.research.entity.VeterinaryEcosystem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface VeterinaryEcosystemRepository extends JpaRepository<VeterinaryEcosystem, Long>, JpaSpecificationExecutor<VeterinaryEcosystem> {

    // Keyset / Cursor Pagination Methods (O(1) seek for 15M records)
    List<VeterinaryEcosystem> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<VeterinaryEcosystem> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query("SELECT e.city as city, COUNT(e) as count FROM VeterinaryEcosystem e WHERE e.city IS NOT NULL AND e.city <> '' GROUP BY e.city ORDER BY count DESC")
    List<Map<String, Object>> countByCityGroup();

    @Query(value = "SELECT DISTINCT state FROM veterinary_ecosystem WHERE state IS NOT NULL AND state <> '' ORDER BY state ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStates();

    @Query(value = "SELECT DISTINCT city FROM veterinary_ecosystem WHERE city IS NOT NULL AND city <> '' ORDER BY city ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCities();

    @Query(value = "SELECT DISTINCT area FROM veterinary_ecosystem WHERE area IS NOT NULL AND area <> '' ORDER BY area ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctAreas();

    @Query(value = "SELECT DISTINCT business_status FROM veterinary_ecosystem WHERE business_status IS NOT NULL AND business_status <> '' ORDER BY business_status ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctBusinessStatuses();

    @Query(value = "SELECT DISTINCT service FROM veterinary_ecosystem WHERE service IS NOT NULL AND service <> '' ORDER BY service ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctServices();

    @Query(value = "SELECT DISTINCT online_verification FROM veterinary_ecosystem WHERE online_verification IS NOT NULL AND online_verification <> '' ORDER BY online_verification ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctOnlineVerifications();

    @Query(value = "SELECT DISTINCT analyst FROM veterinary_ecosystem WHERE analyst IS NOT NULL AND analyst <> '' ORDER BY analyst ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctAnalysts();
}
