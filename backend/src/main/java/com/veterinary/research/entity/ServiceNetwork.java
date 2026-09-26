package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "service_network", indexes = {
        @Index(name = "idx_sn_created_at", columnList = "created_at"),
        @Index(name = "idx_sn_state", columnList = "state"),
        @Index(name = "idx_sn_district", columnList = "district_region"),
        @Index(name = "idx_sn_city_region", columnList = "city_region"),
        @Index(name = "idx_sn_state_city", columnList = "state, city_region"),
        @Index(name = "idx_sn_rating", columnList = "rating")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceNetwork extends BaseEntity {

    @Column(name = "business_name", length = 500)
    private String businessName;

    @Column(name = "service_type", columnDefinition = "TEXT")
    private String serviceType;

    @Column(name = "state", length = 255)
    private String state;

    @Column(name = "district_region", length = 255)
    private String districtRegion;

    @Column(name = "area", columnDefinition = "TEXT")
    private String area;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "city_region", length = 255)
    private String cityRegion;

    @Column(name = "contact_number", length = 255)
    private String contactNumber;

    @Column(name = "website_social_media", columnDefinition = "TEXT")
    private String websiteSocialMedia;

    @Column(name = "rating", precision = 5, scale = 2)
    private BigDecimal rating;

    @Column(name = "google_maps_source_url", columnDefinition = "TEXT")
    private String googleMapsSourceUrl;

    @Column(name = "booking_url_contact", columnDefinition = "TEXT")
    private String bookingUrlContact;
}
