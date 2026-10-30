-- ==============================================================================
-- DA Centre: New 8 Modules MySQL Schema & Performance Indexes
-- Database: veterinary_research
-- ==============================================================================

USE veterinary_research;

-- ------------------------------------------------------------------------------
-- 1. FASHION DESIGNERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fashion_designers` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `designer_name` VARCHAR(500) NULL,
    `brand_name` VARCHAR(500) NULL,
    `specification` TEXT NULL,
    `city` VARCHAR(255) NULL,
    `state` VARCHAR(255) NULL,
    `country` VARCHAR(255) NULL,
    `website_address` TEXT NULL,
    `official_email` VARCHAR(255) NULL,
    `mobile_number` VARCHAR(100) NULL,
    `pincode` VARCHAR(50) NULL,
    `studio_address` TEXT NULL,
    `year_of_establishment` VARCHAR(100) NULL,
    `verification_status` VARCHAR(255) NULL,
    INDEX `idx_fashion_designers_created_at` (`created_at` DESC),
    INDEX `idx_fashion_designers_name` (`designer_name`(100)),
    INDEX `idx_fashion_designers_brand` (`brand_name`(100)),
    INDEX `idx_fashion_designers_city` (`city`(50)),
    INDEX `idx_fashion_designers_state` (`state`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. FASHION INSTITUTES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fashion_institutes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `state` VARCHAR(255) NULL,
    `city` VARCHAR(255) NULL,
    `area` VARCHAR(255) NULL,
    `institute_name` VARCHAR(500) NULL,
    `address` TEXT NULL,
    `pincode` VARCHAR(50) NULL,
    `phone_no` VARCHAR(100) NULL,
    `website` TEXT NULL,
    `email_id` VARCHAR(255) NULL,
    `map_location` TEXT NULL,
    `place_id` VARCHAR(255) NULL,
    `verification_status` VARCHAR(255) NULL,
    INDEX `idx_fashion_institutes_created_at` (`created_at` DESC),
    INDEX `idx_fashion_institutes_name` (`institute_name`(100)),
    INDEX `idx_fashion_institutes_city` (`city`(50)),
    INDEX `idx_fashion_institutes_state` (`state`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. COURIER TIER 1
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `courier_tier_1` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `state` VARCHAR(255) NULL,
    `city` VARCHAR(255) NULL,
    `company_name` VARCHAR(500) NULL,
    `address` TEXT NULL,
    `pincode` VARCHAR(50) NULL,
    `phone_number` VARCHAR(100) NULL,
    `rating` DOUBLE NULL,
    `services` TEXT NULL,
    `website` TEXT NULL,
    INDEX `idx_courier_tier_1_created_at` (`created_at` DESC),
    INDEX `idx_courier_tier_1_company` (`company_name`(100)),
    INDEX `idx_courier_tier_1_city` (`city`(50)),
    INDEX `idx_courier_tier_1_state` (`state`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. PET MANUFACTURERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pet_manufacturers` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `country` VARCHAR(255) NULL,
    `manufacturer_name` VARCHAR(500) NULL,
    `manufacturer_address` TEXT NULL,
    `product_category` VARCHAR(255) NULL,
    `mobile_number` VARCHAR(100) NULL,
    `email_id` VARCHAR(255) NULL,
    `website` TEXT NULL,
    `export_countries` TEXT NULL,
    `source_url` TEXT NULL,
    `verification` VARCHAR(255) NULL,
    `analyst` VARCHAR(255) NULL,
    `command` TEXT NULL,
    INDEX `idx_pet_manufacturers_created_at` (`created_at` DESC),
    INDEX `idx_pet_manufacturers_name` (`manufacturer_name`(100)),
    INDEX `idx_pet_manufacturers_category` (`product_category`(50)),
    INDEX `idx_pet_manufacturers_country` (`country`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. HUMAN AND PET LABS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `human_pet_labs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `state` VARCHAR(255) NULL,
    `city` VARCHAR(255) NULL,
    `laboratory_name` VARCHAR(500) NULL,
    `laboratory_address` TEXT NULL,
    `contact_number` VARCHAR(100) NULL,
    `email_id` VARCHAR(255) NULL,
    `laboratory_type` VARCHAR(255) NULL,
    `testing_services` TEXT NULL,
    `animal_types_covered` TEXT NULL,
    `website` TEXT NULL,
    `google_maps_link` TEXT NULL,
    INDEX `idx_human_pet_labs_created_at` (`created_at` DESC),
    INDEX `idx_human_pet_labs_name` (`laboratory_name`(100)),
    INDEX `idx_human_pet_labs_type` (`laboratory_type`(50)),
    INDEX `idx_human_pet_labs_state` (`state`(50)),
    INDEX `idx_human_pet_labs_city` (`city`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. LIVESTOCK
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `livestock` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `name` VARCHAR(500) NULL,
    `livestock_type` VARCHAR(255) NULL,
    `farm_type` VARCHAR(255) NULL,
    `contact_number` VARCHAR(100) NULL,
    `email` VARCHAR(255) NULL,
    `website` TEXT NULL,
    `address` TEXT NULL,
    `area` VARCHAR(255) NULL,
    `district` VARCHAR(255) NULL,
    `state` VARCHAR(255) NULL,
    `pincode` VARCHAR(50) NULL,
    `services` TEXT NULL,
    `rating` DECIMAL(3,1) NULL,
    `reviews_count` INT NULL,
    `business_status` VARCHAR(100) NULL,
    `google_maps` TEXT NULL,
    `source_url` TEXT NULL,
    INDEX `idx_livestock_created_at` (`created_at` DESC),
    INDEX `idx_livestock_name` (`name`(100)),
    INDEX `idx_livestock_type` (`livestock_type`(50)),
    INDEX `idx_livestock_state` (`state`(50)),
    INDEX `idx_livestock_district` (`district`(50)),
    INDEX `idx_livestock_rating` (`rating` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. PHILIPPINES PET PRODUCTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `philippines_pet_products` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `country` VARCHAR(150) NULL,
    `product_name` VARCHAR(500) NULL,
    `brand_name` VARCHAR(255) NULL,
    `product_description` TEXT NULL,
    `minimum_price_php` DECIMAL(12,2) NULL,
    `maximum_price_php` DECIMAL(12,2) NULL,
    `current_selling_price_php` DECIMAL(12,2) NULL,
    `availability` VARCHAR(100) NULL,
    `marketplace_name` VARCHAR(255) NULL,
    `product_url` TEXT NULL,
    `product_image_url` TEXT NULL,
    `source_url` TEXT NULL,
    `command` TEXT NULL,
    INDEX `idx_ph_pet_products_created_at` (`created_at` DESC),
    INDEX `idx_ph_pet_products_name` (`product_name`(100)),
    INDEX `idx_ph_pet_products_brand` (`brand_name`(50)),
    INDEX `idx_ph_pet_products_marketplace` (`marketplace_name`(50)),
    INDEX `idx_ph_pet_products_price` (`current_selling_price_php`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. POULTRY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `poultry` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `name` VARCHAR(500) NULL,
    `category` VARCHAR(255) NULL,
    `sub_category` VARCHAR(255) NULL,
    `phone` VARCHAR(100) NULL,
    `website` TEXT NULL,
    `address` TEXT NULL,
    `area` VARCHAR(255) NULL,
    `district` VARCHAR(255) NULL,
    `state` VARCHAR(255) NULL,
    `pincode` VARCHAR(50) NULL,
    `business_tag` VARCHAR(255) NULL,
    `rating` DECIMAL(3,1) NULL,
    `reviews` VARCHAR(100) NULL,
    `status` VARCHAR(100) NULL,
    `source` VARCHAR(255) NULL,
    `maps_link` TEXT NULL,
    `analyst` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    INDEX `idx_poultry_created_at` (`created_at` DESC),
    INDEX `idx_poultry_name` (`name`(100)),
    INDEX `idx_poultry_category` (`category`(50)),
    INDEX `idx_poultry_district` (`district`(50)),
    INDEX `idx_poultry_state` (`state`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

