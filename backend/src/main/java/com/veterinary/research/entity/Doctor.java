package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "doctors", indexes = {
        @Index(name = "idx_doctors_created_at", columnList = "created_at"),
        @Index(name = "idx_doctors_fee", columnList = "fee")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor extends BaseEntity {

    @Column(name = "doctor_name", length = 500)
    private String doctorName;

    @Column(name = "qualification", columnDefinition = "TEXT")
    private String qualification;

    @Column(name = "specialist", columnDefinition = "TEXT")
    private String specialist;

    @Column(name = "experience", columnDefinition = "TEXT")
    private String experience;

    @Column(name = "location", columnDefinition = "TEXT")
    private String location;

    @Column(name = "hospital", columnDefinition = "TEXT")
    private String hospital;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "fee", precision = 12, scale = 2)
    private BigDecimal fee;

    @Column(name = "working_hrs", columnDefinition = "TEXT")
    private String workingHours;

    @Column(name = "doctor_url", columnDefinition = "TEXT")
    private String doctorUrl;
}
