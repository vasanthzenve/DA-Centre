package com.veterinary.research.repository;

import com.veterinary.research.entity.MarketResearch;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface MarketResearchRepository extends JpaRepository<MarketResearch, Long>, JpaSpecificationExecutor<MarketResearch> {
    
    // Keyset / Cursor Pagination Methods (O(1) seek for 15M records)
    List<MarketResearch> findByIdLessThanOrderByIdDesc(Long id, Pageable pageable);
    List<MarketResearch> findByIdGreaterThanOrderByIdAsc(Long id, Pageable pageable);

    @Query("SELECT r.states as state, COUNT(r) as count FROM MarketResearch r WHERE r.states IS NOT NULL AND r.states <> '' GROUP BY r.states ORDER BY count DESC")
    List<Map<String, Object>> countByStateGroup();

    @Query(value = "SELECT DISTINCT states FROM market_research WHERE states IS NOT NULL AND states <> '' ORDER BY states ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctStates();

    @Query(value = "SELECT DISTINCT company FROM market_research WHERE company IS NOT NULL AND company <> '' ORDER BY company ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCompanies();

    @Query(value = "SELECT DISTINCT cities FROM market_research WHERE cities IS NOT NULL AND cities <> '' ORDER BY cities ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctCities();

    @Query(value = "SELECT DISTINCT model FROM market_research WHERE model IS NOT NULL AND model <> '' ORDER BY model ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctModels();

    @Query(value = "SELECT DISTINCT scale FROM market_research WHERE scale IS NOT NULL AND scale <> '' ORDER BY scale ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctScales();

    @Query(value = "SELECT DISTINCT target_segment FROM market_research WHERE target_segment IS NOT NULL AND target_segment <> '' ORDER BY target_segment ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctTargetSegments();

    @Query(value = "SELECT DISTINCT technology FROM market_research WHERE technology IS NOT NULL AND technology <> '' ORDER BY technology ASC LIMIT 100", nativeQuery = true)
    List<String> findDistinctTechnologies();
}
