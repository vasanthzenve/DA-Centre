package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fashion_institutes", indexes = {
        @Index(name = "idx_fashion_institutes_created_at", columnList = "created_at"),
        @Index(name = "idx_fashion_institutes_name", columnList = "institute_name"),
        @Index(name = "idx_fashion_institutes_city", columnList = "city"),
        @Index(name = "idx_fashion_institutes_state", columnList = "state")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FashionInstitute extends BaseEntity {

    @Column(name = "state", length = 255)
    private String state;

    @Column(name = "city", length = 255)
    private String city;

    @Column(name = "area", length = 255)
    private String area;

    @Column(name = "institute_name", length = 500)
    private String instituteName;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "pincode", length = 50)
    private String pincode;

    @Column(name = "phone_no", length = 100)
    private String phoneNo;

    @Column(name = "website", columnDefinition = "TEXT")
    private String website;

    @Column(name = "email_id", length = 255)
    private String emailId;

    @Column(name = "map_location", columnDefinition = "TEXT")
    private String mapLocation;

    @Column(name = "place_id", length = 255)
    private String placeId;

    @Column(name = "verification_status", length = 255)
    private String verificationStatus;
}

