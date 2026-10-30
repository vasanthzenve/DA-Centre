package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courier_tier_1", indexes = {
        @Index(name = "idx_courier_tier_1_created_at", columnList = "created_at"),
        @Index(name = "idx_courier_tier_1_company", columnList = "company_name"),
        @Index(name = "idx_courier_tier_1_city", columnList = "city"),
        @Index(name = "idx_courier_tier_1_state", columnList = "state")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourierTier1 extends BaseEntity {

    @Column(name = "state", length = 255)
    private String state;

    @Column(name = "city", length = 255)
    private String city;

    @Column(name = "company_name", length = 500)
    private String companyName;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "pincode", length = 50)
    private String pincode;

    @Column(name = "phone_number", length = 100)
    private String phoneNumber;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "services", columnDefinition = "TEXT")
    private String services;

    @Column(name = "website", columnDefinition = "TEXT")
    private String website;
}

