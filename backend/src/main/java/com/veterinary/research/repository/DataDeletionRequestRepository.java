package com.veterinary.research.repository;

import com.veterinary.research.entity.DataDeletionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DataDeletionRequestRepository extends JpaRepository<DataDeletionRequest, Long> {

    List<DataDeletionRequest> findByStatusOrderByRequestedAtDesc(String status);

    List<DataDeletionRequest> findAllByOrderByRequestedAtDesc();

    List<DataDeletionRequest> findByUserIdOrderByRequestedAtDesc(Long userId);

    long countByStatus(String status);
}
