package com.veterinary.research.controller;

import com.veterinary.research.dto.ApiResponse;
import com.veterinary.research.entity.DataDeletionRequest;
import com.veterinary.research.repository.DataDeletionRequestRepository;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/data-deletions")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DataDeletionController {

    private final DataDeletionRequestRepository deletionRequestRepository;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CreateDeletionRequestDTO {
        private String dataType;
        private Long dataId;
        private String dataTitle;
        private String reason;
        private Long userId;
        private String userCustomId;
        private String userEmail;
        private String userName;
    }

    /**
     * Users submit a deletion request with reason to the Administrator
     */
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<DataDeletionRequest>> submitDeletionRequest(
            @RequestBody CreateDeletionRequestDTO dto) {

        if (dto.getReason() == null || dto.getReason().trim().isBlank()) {
            throw new IllegalArgumentException("A valid reason is required to submit a data deletion request to the Administrator.");
        }
        if (dto.getDataId() == null || dto.getDataType() == null || dto.getDataType().trim().isBlank()) {
            throw new IllegalArgumentException("Target data reference is required for deletion request.");
        }

        DataDeletionRequest request = DataDeletionRequest.builder()
                .userId(dto.getUserId())
                .userCustomId(dto.getUserCustomId())
                .userEmail(dto.getUserEmail() != null ? dto.getUserEmail().trim() : "anonymous@user.com")
                .userName(dto.getUserName() != null ? dto.getUserName().trim() : "DA Centre User")
                .dataType(dto.getDataType().trim())
                .dataId(dto.getDataId())
                .dataTitle(dto.getDataTitle() != null ? dto.getDataTitle().trim() : ("ID #" + dto.getDataId()))
                .reason(dto.getReason().trim())
                .status("PENDING")
                .requestedAt(LocalDateTime.now())
                .autoDeleted(false)
                .build();

        DataDeletionRequest saved = deletionRequestRepository.save(request);
        log.info("Data deletion request submitted by user {} for [{} - {}]: {}",
                saved.getUserEmail(), saved.getDataType(), saved.getDataTitle(), saved.getReason());

        return ResponseEntity.ok(ApiResponse.success(
                "Your deletion request has been submitted to the Administrator for approval. The data will be automatically deleted upon Admin approval.",
                saved
        ));
    }

    /**
     * View deletion requests submitted by current user
     */
    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<DataDeletionRequest>>> getMyRequests(
            @RequestParam(required = false) Long userId) {
        List<DataDeletionRequest> list;
        if (userId != null) {
            list = deletionRequestRepository.findByUserIdOrderByRequestedAtDesc(userId);
        } else {
            list = deletionRequestRepository.findAllByOrderByRequestedAtDesc();
        }
        return ResponseEntity.ok(ApiResponse.success("Requests retrieved", list));
    }
}
