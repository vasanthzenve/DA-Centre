package com.veterinary.research.repository;

import com.veterinary.research.entity.SidebarModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SidebarModuleRepository extends JpaRepository<SidebarModule, Long>, JpaSpecificationExecutor<SidebarModule> {

    List<SidebarModule> findByStatusOrderByCreatedAtDesc(String status);

    Optional<SidebarModule> findByModuleSlug(String moduleSlug);

    Optional<SidebarModule> findByModuleSlugAndStatus(String moduleSlug, String status);

    Optional<SidebarModule> findFirstBySidebarNameIgnoreCase(String sidebarName);

    boolean existsByModuleSlug(String moduleSlug);

    boolean existsBySidebarName(String sidebarName);

    @Query("SELECT m FROM SidebarModule m WHERE m.status = 'ACTIVE' ORDER BY m.sidebarName ASC")
    List<SidebarModule> findAllActive();
}

