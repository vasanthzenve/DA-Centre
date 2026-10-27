package com.veterinary.research.controller;

import com.veterinary.research.dto.ApiResponse;
import com.veterinary.research.entity.ChatbotMessage;
import com.veterinary.research.repository.ChatbotMessageRepository;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class ChatbotController {

    private final ChatbotMessageRepository chatbotMessageRepository;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ChatMessageRequest {
        private String message;
        private String userEmail;
        private String userName;
        private Long userId;
        private String userCustomId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class AdminReplyRequest {
        private String userEmail;
        private String message;
        private String adminEmail;
    }

    /**
     * User sends a query to the Chatbot (directly connected to Admin)
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<ChatbotMessage>> sendMessage(@RequestBody ChatMessageRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isBlank()) {
            throw new IllegalArgumentException("Message content cannot be blank.");
        }

        String email = (request.getUserEmail() != null && !request.getUserEmail().isBlank())
                ? request.getUserEmail().trim().toLowerCase()
                : "guest@dacentre.com";

        ChatbotMessage message = ChatbotMessage.builder()
                .userId(request.getUserId())
                .userCustomId(request.getUserCustomId())
                .userEmail(email)
                .userName(request.getUserName() != null ? request.getUserName().trim() : "DA Centre User")
                .sender("USER")
                .message(request.getMessage().trim())
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();

        ChatbotMessage saved = chatbotMessageRepository.save(message);
        log.info("Chatbot query received from {} forward-routed to Admin Console: {}", email, saved.getMessage());

        return ResponseEntity.ok(ApiResponse.success("Message delivered directly to Administrator", saved));
    }

    /**
     * Retrieve conversation history for a user
     */
    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<List<ChatbotMessage>>> getUserMessages(
            @RequestParam(required = false, defaultValue = "guest@dacentre.com") String userEmail) {
        List<ChatbotMessage> messages = chatbotMessageRepository.findByUserEmailOrderByTimestampAsc(userEmail.trim().toLowerCase());
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved", messages));
    }

    /**
     * Admin Console: List all user conversation threads
     */
    @GetMapping("/admin/conversations")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAdminConversations() {
        List<ChatbotMessage> allMessages = chatbotMessageRepository.findTop100ByOrderByTimestampDesc();

        // Group by userEmail
        Map<String, List<ChatbotMessage>> grouped = allMessages.stream()
                .filter(m -> m.getUserEmail() != null)
                .collect(Collectors.groupingBy(m -> m.getUserEmail().toLowerCase()));

        List<Map<String, Object>> threads = new ArrayList<>();
        grouped.forEach((email, msgs) -> {
            msgs.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
            ChatbotMessage latest = msgs.get(0);
            long unread = msgs.stream().filter(m -> "USER".equals(m.getSender()) && !Boolean.TRUE.equals(m.getIsRead())).count();

            Map<String, Object> thread = new HashMap<>();
            thread.put("userEmail", email);
            thread.put("userName", latest.getUserName());
            thread.put("userCustomId", latest.getUserCustomId());
            thread.put("lastMessage", latest.getMessage());
            thread.put("lastSender", latest.getSender());
            thread.put("lastTimestamp", latest.getTimestamp());
            thread.put("unreadCount", unread);
            threads.add(thread);
        });

        // Sort by latest timestamp descending
        threads.sort((a, b) -> ((LocalDateTime) b.get("lastTimestamp")).compareTo((LocalDateTime) a.get("lastTimestamp")));

        return ResponseEntity.ok(ApiResponse.success("Conversation threads retrieved", threads));
    }

    /**
     * Admin Console: Get all messages in a specific thread
     */
    @GetMapping("/admin/thread")
    public ResponseEntity<ApiResponse<List<ChatbotMessage>>> getThreadMessages(@RequestParam String userEmail) {
        List<ChatbotMessage> messages = chatbotMessageRepository.findByUserEmailOrderByTimestampAsc(userEmail.trim().toLowerCase());
        return ResponseEntity.ok(ApiResponse.success("Thread messages retrieved", messages));
    }

    /**
     * Admin Console: Direct reply from Admin to User
     */
    @PostMapping("/admin/reply")
    @Transactional
    public ResponseEntity<ApiResponse<ChatbotMessage>> replyToUser(@RequestBody AdminReplyRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isBlank()) {
            throw new IllegalArgumentException("Admin reply message cannot be blank.");
        }
        if (request.getUserEmail() == null || request.getUserEmail().isBlank()) {
            throw new IllegalArgumentException("Target user email is required.");
        }

        String targetEmail = request.getUserEmail().trim().toLowerCase();

        // Mark all user messages in this thread as read
        List<ChatbotMessage> userMessages = chatbotMessageRepository.findByUserEmailOrderByTimestampAsc(targetEmail);
        for (ChatbotMessage m : userMessages) {
            if ("USER".equals(m.getSender()) && !Boolean.TRUE.equals(m.getIsRead())) {
                m.setIsRead(true);
                chatbotMessageRepository.save(m);
            }
        }

        // Save Admin reply
        ChatbotMessage adminMsg = ChatbotMessage.builder()
                .userEmail(targetEmail)
                .userName("DA Centre Administrator")
                .sender("ADMIN")
                .message(request.getMessage().trim())
                .timestamp(LocalDateTime.now())
                .isRead(true)
                .build();

        ChatbotMessage saved = chatbotMessageRepository.save(adminMsg);
        log.info("Admin replied to user {}: {}", targetEmail, saved.getMessage());

        return ResponseEntity.ok(ApiResponse.success("Reply successfully sent to user", saved));
    }
}
