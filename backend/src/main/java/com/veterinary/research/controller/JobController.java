package com.veterinary.research.controller;

import com.veterinary.research.dto.ApiResponse;
import com.veterinary.research.excel.ExcelService;
import com.veterinary.research.job.JobInfo;
import com.veterinary.research.job.JobManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Slf4j
public class JobController {

    private final JobManager jobManager;
    private final ExcelService excelService;

    @GetMapping("/{jobId}")
    public ResponseEntity<ApiResponse<JobInfo>> getJobStatus(@PathVariable String jobId) {
        JobInfo job = jobManager.getJob(jobId);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(job));
    }

    @GetMapping("/{jobId}/download")
    public ResponseEntity<Resource> downloadExportFile(@PathVariable String jobId) {
        JobInfo job = jobManager.getJob(jobId);
        if (job == null || job.getFilePath() == null) {
            return ResponseEntity.notFound().build();
        }

        File file = new File(job.getFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType = "csv".equalsIgnoreCase(job.getFormat())
                ? MediaType.parseMediaType("text/csv")
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        String downloadName = job.getFileName() != null ? job.getFileName() : ("export." + job.getFormat());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                .contentType(mediaType)
                .contentLength(file.length())
                .body(new FileSystemResource(file));
    }

    @PostMapping("/{module}/import-async")
    public ResponseEntity<ApiResponse<JobInfo>> startAsyncImport(
            @PathVariable String module,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        JobInfo job = excelService.startAsyncImport(module, file);
        return ResponseEntity.ok(ApiResponse.success("Import task queued successfully", job));
    }
}
