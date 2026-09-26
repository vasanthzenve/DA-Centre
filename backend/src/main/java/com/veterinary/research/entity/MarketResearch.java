package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "market_research", indexes = {
        @Index(name = "idx_mr_created_at", columnList = "created_at"),
        @Index(name = "idx_mr_price", columnList = "price")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketResearch extends BaseEntity {

    @Column(name = "states", columnDefinition = "TEXT")
    private String states;

    @Column(name = "company", length = 500)
    private String company;

    @Column(name = "founded", length = 100)
    private String founded;

    @Column(name = "cities", columnDefinition = "TEXT")
    private String cities;

    @Column(name = "model", columnDefinition = "TEXT")
    private String model;

    @Column(name = "scale", columnDefinition = "TEXT")
    private String scale;

    @Column(name = "funding", columnDefinition = "TEXT")
    private String funding;

    @Column(name = "service", columnDefinition = "TEXT")
    private String service;

    @Column(name = "revenue", columnDefinition = "TEXT")
    private String revenue;

    @Column(name = "target_segment", columnDefinition = "TEXT")
    private String targetSegment;

    @Column(name = "price", length = 255)
    private String price;

    @Column(name = "product", columnDefinition = "TEXT")
    private String product;

    @Column(name = "technology", columnDefinition = "TEXT")
    private String technology;
}
