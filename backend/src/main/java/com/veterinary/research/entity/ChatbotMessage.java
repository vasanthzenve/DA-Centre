package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chatbot_messages", indexes = {
        @Index(name = "idx_chat_user_id", columnList = "user_id"),
        @Index(name = "idx_chat_user_email", columnList = "user_email"),
        @Index(name = "idx_chat_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotMessage extends BaseEntity {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_custom_id", length = 50)
    private String userCustomId;

    @Column(name = "user_email", length = 150)
    private String userEmail;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Column(name = "sender", nullable = false, length = 20)
    private String sender; // "USER" or "ADMIN"

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;
}
