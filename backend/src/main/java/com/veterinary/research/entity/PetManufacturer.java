package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pet_manufacturers", indexes = {
        @Index(name = "idx_pet_manufacturers_created_at", columnList = "created_at"),
        @Index(name = "idx_pet_manufacturers_name", columnList = "manufacturer_name"),
        @Index(name = "idx_pet_manufacturers_category", columnList = "product_category"),
        @Index(name = "idx_pet_manufacturers_country", columnList = "country")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetManufacturer extends BaseEntity {

    @Column(name = "country", length = 255)
    private String country;

    @Column(name = "manufacturer_name", length = 500)
    private String manufacturerName;

    @Column(name = "manufacturer_address", columnDefinition = "TEXT")
    private String manufacturerAddress;

    @Column(name = "product_category", length = 255)
    private String productCategory;

    @Column(name = "mobile_number", length = 100)
    private String mobileNumber;

    @Column(name = "email_id", length = 255)
    private String emailId;

    @Column(name = "website", columnDefinition = "TEXT")
    private String website;

    @Column(name = "export_countries", columnDefinition = "TEXT")
    private String exportCountries;

    @Column(name = "source_url", columnDefinition = "TEXT")
    private String sourceUrl;

    @Column(name = "verification", length = 255)
    private String verification;

    @Column(name = "analyst", length = 255)
    private String analyst;

    @Column(name = "command", columnDefinition = "TEXT")
    private String command;
}

