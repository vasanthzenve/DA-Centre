package com.veterinary.research.repository;

import com.veterinary.research.entity.ChatbotMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatbotMessageRepository extends JpaRepository<ChatbotMessage, Long> {

    List<ChatbotMessage> findByUserEmailOrderByTimestampAsc(String userEmail);

    List<ChatbotMessage> findByUserIdOrderByTimestampAsc(Long userId);

    List<ChatbotMessage> findTop100ByOrderByTimestampDesc();

    long countByIsReadFalseAndSender(String sender);

    @Query("SELECT DISTINCT m.userEmail FROM ChatbotMessage m WHERE m.userEmail IS NOT NULL")
    List<String> findDistinctUserEmails();
}
