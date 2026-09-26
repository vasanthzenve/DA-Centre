package com.veterinary.research.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class JobManager {

    private final Map<String, JobInfo> localJobStore = new ConcurrentHashMap<>();

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    private static final String REDIS_JOB_PREFIX = "da_centre:job:";
    private static final Duration JOB_TTL = Duration.ofHours(24);

    public JobInfo createJob(String module, JobInfo.JobType type, String format) {
        String jobId = UUID.randomUUID().toString();
        JobInfo job = JobInfo.builder()
                .jobId(jobId)
                .module(module)
                .jobType(type)
                .status(JobInfo.Status.PENDING)
                .format(format != null ? format.toLowerCase() : "xlsx")
                .createdAt(LocalDateTime.now())
                .message("Job initialized and queued for processing")
                .build();

        saveJob(job);
        log.info("Created async job [{}]: {} for module [{}]", jobId, type, module);
        return job;
    }

    public void updateProgress(String jobId, long processed, long total, String message) {
        JobInfo job = getJob(jobId);
        if (job != null) {
            job.setStatus(JobInfo.Status.RUNNING);
            job.updateProgress(processed, total);
            if (message != null) job.setMessage(message);
            saveJob(job);
        }
    }

    public void completeJob(String jobId, long totalRows, long successRows, long failedRows, String fileName, String filePath, String downloadUrl) {
        JobInfo job = getJob(jobId);
        if (job != null) {
            job.setStatus(JobInfo.Status.COMPLETED);
            job.setTotalRows(totalRows);
            job.setProcessedRows(totalRows);
            job.setSuccessRows(successRows);
            job.setFailedRows(failedRows);
            job.setProgressPercent(100);
            job.setFileName(fileName);
            job.setFilePath(filePath);
            job.setDownloadUrl(downloadUrl);
            job.setCompletedAt(LocalDateTime.now());
            job.setMessage("Job completed successfully. " + successRows + " rows processed.");
            saveJob(job);
            log.info("Job [{}] completed successfully ({} rows)", jobId, totalRows);
        }
    }

    public void failJob(String jobId, String errorMessage, Exception ex) {
        JobInfo job = getJob(jobId);
        if (job != null) {
            job.setStatus(JobInfo.Status.FAILED);
            job.setMessage(errorMessage);
            if (ex != null) {
                job.getErrors().add(ex.getMessage() != null ? ex.getMessage() : ex.toString());
            }
            job.setCompletedAt(LocalDateTime.now());
            saveJob(job);
            log.error("Job [{}] failed: {}", jobId, errorMessage, ex);
        }
    }

    public JobInfo getJob(String jobId) {
        if (jobId == null) return null;

        // Try local cache first
        JobInfo local = localJobStore.get(jobId);
        if (local != null) return local;

        // Check Redis for cross-instance lookup
        if (redisTemplate != null) {
            try {
                Object obj = redisTemplate.opsForValue().get(REDIS_JOB_PREFIX + jobId);
                if (obj instanceof JobInfo) {
                    localJobStore.put(jobId, (JobInfo) obj);
                    return (JobInfo) obj;
                }
            } catch (Exception e) {
                log.warn("Could not query Redis for job [{}]: {}", jobId, e.getMessage());
            }
        }

        return null;
    }

    private void saveJob(JobInfo job) {
        localJobStore.put(job.getJobId(), job);
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(REDIS_JOB_PREFIX + job.getJobId(), job, JOB_TTL);
            } catch (Exception e) {
                log.warn("Could not sync job [{}] to Redis: {}", job.getJobId(), e.getMessage());
            }
        }
    }
}
