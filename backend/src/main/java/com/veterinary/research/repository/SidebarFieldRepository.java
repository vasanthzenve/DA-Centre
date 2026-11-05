package com.veterinary.research.repository;

import com.veterinary.research.entity.SidebarField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SidebarFieldRepository extends JpaRepository<SidebarField, Long> {

    List<SidebarField> findByModuleIdOrderByColumnPositionAsc(Long moduleId);

    List<SidebarField> findByModuleIdAndSheetNameOrderByColumnPositionAsc(Long moduleId, String sheetName);

    @Query("SELECT DISTINCT f.sheetName FROM SidebarField f WHERE f.moduleId = :moduleId ORDER BY f.sheetName ASC")
    List<String> findDistinctSheetNamesByModuleId(Long moduleId);

    @Modifying
    @Query("DELETE FROM SidebarField f WHERE f.moduleId = :moduleId")
    void deleteByModuleId(Long moduleId);

    @Modifying
    @Query("DELETE FROM SidebarField f WHERE f.moduleId = :moduleId AND f.sheetName = :sheetName")
    void deleteByModuleIdAndSheetName(Long moduleId, String sheetName);
}

