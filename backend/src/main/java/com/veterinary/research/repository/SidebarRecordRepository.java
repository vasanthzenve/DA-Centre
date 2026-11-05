package com.veterinary.research.repository;

import com.veterinary.research.entity.SidebarRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SidebarRecordRepository extends JpaRepository<SidebarRecord, Long>, JpaSpecificationExecutor<SidebarRecord> {

    Page<SidebarRecord> findByModuleIdAndSheetName(Long moduleId, String sheetName, Pageable pageable);

    List<SidebarRecord> findByModuleIdAndSheetNameOrderByRowNumberAsc(Long moduleId, String sheetName);

    long countByModuleId(Long moduleId);

    long countByModuleIdAndSheetName(Long moduleId, String sheetName);

    @Modifying
    @Query("DELETE FROM SidebarRecord r WHERE r.moduleId = :moduleId")
    void deleteByModuleId(@Param("moduleId") Long moduleId);

    @Modifying
    @Query("DELETE FROM SidebarRecord r WHERE r.moduleId = :moduleId AND r.id IN :ids")
    void deleteByModuleIdAndIdIn(@Param("moduleId") Long moduleId, @Param("ids") List<Long> ids);

    @Query(value = "SELECT * FROM sidebar_records WHERE module_id = :moduleId AND sheet_name = :sheetName " +
            "AND (:search IS NULL OR :search = '' OR LOWER(row_data) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY `row_number` ASC",
            countQuery = "SELECT count(*) FROM sidebar_records WHERE module_id = :moduleId AND sheet_name = :sheetName " +
                    "AND (:search IS NULL OR :search = '' OR LOWER(row_data) LIKE LOWER(CONCAT('%', :search, '%')))",
            nativeQuery = true)
    Page<SidebarRecord> searchRecords(
            @Param("moduleId") Long moduleId,
            @Param("sheetName") String sheetName,
            @Param("search") String search,
            Pageable pageable
    );
}

