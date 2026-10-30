package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fashion_designers", indexes = {
        @Index(name = "idx_fashion_designers_created_at", columnList = "created_at"),
        @Index(name = "idx_fashion_designers_name", columnList = "designer_name"),
        @Index(name = "idx_fashion_designers_brand", columnList = "brand_name"),
        @Index(name = "idx_fashion_designers_city", columnList = "city"),
        @Index(name = "idx_fashion_designers_state", columnList = "state")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FashionDesigner extends BaseEntity {

    @Column(name = "designer_name", length = 500)
    private String designerName;

    @Column(name = "brand_name", length = 500)
    private String brandName;

    @Column(name = "specification", columnDefinition = "TEXT")
    private String specification;

    @Column(name = "city", length = 255)
    private String city;

    @Column(name = "state", length = 255)
    private String state;

    @Column(name = "country", length = 255)
    private String country;

    @Column(name = "website_address", columnDefinition = "TEXT")
    private String websiteAddress;

    @Column(name = "official_email", length = 255)
    private String officialEmail;

    @Column(name = "mobile_number", length = 100)
    private String mobileNumber;

    @Column(name = "pincode", length = 50)
    private String pincode;

    @Column(name = "studio_address", columnDefinition = "TEXT")
    private String studioAddress;

    @Column(name = "year_of_establishment", length = 100)
    private String yearOfEstablishment;

    @Column(name = "verification_status", length = 255)
    private String verificationStatus;
}

