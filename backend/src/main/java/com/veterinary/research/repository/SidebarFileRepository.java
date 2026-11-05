package com.veterinary.research.repository;

import com.veterinary.research.entity.SidebarFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SidebarFileRepository extends JpaRepository<SidebarFile, Long> {

    List<SidebarFile> findByModuleId(Long moduleId);

    Optional<SidebarFile> findFirstByModuleIdOrderByUploadedAtDesc(Long moduleId);

    @Modifying
    @Query("DELETE FROM SidebarFile f WHERE f.moduleId = :moduleId")
    void deleteByModuleId(Long moduleId);
}

