package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "human_pet_labs", indexes = {
        @Index(name = "idx_human_pet_labs_created_at", columnList = "created_at"),
        @Index(name = "idx_human_pet_labs_name", columnList = "laboratory_name"),
        @Index(name = "idx_human_pet_labs_type", columnList = "laboratory_type"),
        @Index(name = "idx_human_pet_labs_state", columnList = "state"),
        @Index(name = "idx_human_pet_labs_city", columnList = "city")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HumanPetLab extends BaseEntity {

    @Column(name = "state", length = 255)
    private String state;

    @Column(name = "city", length = 255)
    private String city;

    @Column(name = "laboratory_name", length = 500)
    private String laboratoryName;

    @Column(name = "laboratory_address", columnDefinition = "TEXT")
    private String laboratoryAddress;

    @Column(name = "contact_number", length = 100)
    private String contactNumber;

    @Column(name = "email_id", length = 255)
    private String emailId;

    @Column(name = "laboratory_type", length = 255)
    private String laboratoryType;

    @Column(name = "testing_services", columnDefinition = "TEXT")
    private String testingServices;

    @Column(name = "animal_types_covered", columnDefinition = "TEXT")
    private String animalTypesCovered;

    @Column(name = "website", columnDefinition = "TEXT")
    private String website;

    @Column(name = "google_maps_link", columnDefinition = "TEXT")
    private String googleMapsLink;
}

