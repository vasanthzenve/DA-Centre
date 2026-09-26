package com.veterinary.research.initializr;

import com.veterinary.research.entity.User;
import com.veterinary.research.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        log.info("Database bootstrap completed successfully.");
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@veterinary.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Chief Veterinary Analyst")
                    .role("ADMIN")
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin / admin123");
        }
    }
}
