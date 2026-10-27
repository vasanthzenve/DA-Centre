package com.veterinary.research.repository;

import com.veterinary.research.entity.UserLoginSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserLoginSessionRepository extends JpaRepository<UserLoginSession, Long> {

    Optional<UserLoginSession> findBySessionToken(String sessionToken);

    List<UserLoginSession> findByUserIdOrderByLoginTimeDesc(Long userId);

    List<UserLoginSession> findTop100ByOrderByLoginTimeDesc();

    long countByStatus(String status);

    @Query("SELECT COUNT(s) FROM UserLoginSession s WHERE s.status = 'ACTIVE' AND s.lastActiveTime >= :threshold")
    long countActiveSessionsSince(LocalDateTime threshold);

    @Query("SELECT COALESCE(SUM(s.durationSeconds), 0) FROM UserLoginSession s")
    Long sumTotalDurationSeconds();

    @Query("SELECT COALESCE(SUM(s.durationSeconds), 0) FROM UserLoginSession s WHERE s.userId = :userId")
    Long sumDurationSecondsByUserId(Long userId);
}
