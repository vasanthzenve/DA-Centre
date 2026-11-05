-- ==============================================================================
-- DYNAMIC SIDEBAR GENERATOR & NO-CODE MODULE BUILDER SCHEMA
-- ==============================================================================

USE `veterinary_research`;

DROP TABLE IF EXISTS `sidebar_records`;
DROP TABLE IF EXISTS `sidebar_fields`;
DROP TABLE IF EXISTS `sidebar_files`;
DROP TABLE IF EXISTS `sidebar_modules`;

-- 1. Sidebar Modules Table
CREATE TABLE IF NOT EXISTS `sidebar_modules` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sidebar_name` VARCHAR(255) NOT NULL,
    `module_slug` VARCHAR(255) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `uploaded_file_name` VARCHAR(500) NULL,
    `file_path` VARCHAR(1000) NULL,
    `total_sheets` INT DEFAULT 1,
    `total_rows` INT DEFAULT 0,
    `total_columns` INT DEFAULT 0,
    `status` VARCHAR(50) DEFAULT 'ACTIVE',
    `created_by` VARCHAR(255) DEFAULT 'Admin',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_sidebar_modules_slug` (`module_slug`),
    INDEX `idx_sidebar_modules_status` (`status`),
    INDEX `idx_sidebar_modules_created_at` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Sidebar Fields Table (Extracted columns metadata)
CREATE TABLE IF NOT EXISTS `sidebar_fields` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `module_id` BIGINT NOT NULL,
    `sheet_name` VARCHAR(255) NOT NULL DEFAULT 'Sheet1',
    `field_name` VARCHAR(255) NOT NULL,
    `field_label` VARCHAR(255) NOT NULL,
    `data_type` VARCHAR(50) NOT NULL DEFAULT 'String',
    `column_position` INT NOT NULL DEFAULT 0,
    `is_required` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_sidebar_fields_module` (`module_id`),
    INDEX `idx_sidebar_fields_module_sheet` (`module_id`, `sheet_name`),
    INDEX `idx_sidebar_fields_pos` (`module_id`, `column_position`),
    CONSTRAINT `fk_sidebar_fields_module` FOREIGN KEY (`module_id`) REFERENCES `sidebar_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Sidebar Records Table (Parsed row data stored as high-performance JSON)
CREATE TABLE IF NOT EXISTS `sidebar_records` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `module_id` BIGINT NOT NULL,
    `sheet_name` VARCHAR(255) NOT NULL DEFAULT 'Sheet1',
    `row_number` INT NOT NULL DEFAULT 0,
    `row_data` LONGTEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_sidebar_records_module` (`module_id`),
    INDEX `idx_sidebar_records_module_sheet` (`module_id`, `sheet_name`),
    INDEX `idx_sidebar_records_row` (`module_id`, `row_number`),
    CONSTRAINT `fk_sidebar_records_module` FOREIGN KEY (`module_id`) REFERENCES `sidebar_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Sidebar Files Table (Original uploaded file references)
CREATE TABLE IF NOT EXISTS `sidebar_files` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `module_id` BIGINT NOT NULL,
    `original_file_name` VARCHAR(500) NOT NULL,
    `stored_file_path` VARCHAR(1000) NOT NULL,
    `file_type` VARCHAR(100) NOT NULL,
    `file_size` BIGINT NOT NULL DEFAULT 0,
    `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_sidebar_files_module` (`module_id`),
    CONSTRAINT `fk_sidebar_files_module` FOREIGN KEY (`module_id`) REFERENCES `sidebar_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
