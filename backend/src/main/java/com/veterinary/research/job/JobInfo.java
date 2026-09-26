package com.veterinary.research.job;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobInfo implements Serializable {

    public enum JobType {
        IMPORT,
        EXPORT
    }

    public enum Status {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED
    }

    private String jobId;
    private String module;
    private JobType jobType;
    private Status status;
    private String format; // "xlsx", "csv"
    
    private long totalRows;
    private long processedRows;
    private long successRows;
    private long failedRows;
    private int progressPercent;

    private String message;
    private String fileName;
    private String filePath;
    private String downloadUrl;

    @Builder.Default
    private List<String> errors = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public void updateProgress(long processed, long total) {
        this.processedRows = processed;
        this.totalRows = total;
        if (total > 0) {
            this.progressPercent = Math.min(100, (int) ((processed * 100) / total));
        }
    }
}
