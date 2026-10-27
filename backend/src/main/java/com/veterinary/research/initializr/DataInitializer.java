package com.veterinary.research.initializr;

import com.veterinary.research.entity.User;
import com.veterinary.research.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedOfficialAdmin();
        log.info("Database bootstrap completed successfully.");
    }

    private void seedOfficialAdmin() {
        // Seed or update the requested official Admin credentials:
        // Mail ID: dacentreadmin@gmail.com
        // Password: admin@zenve111
        Optional<User> existingAdmin = userRepository.findByEmail("dacentreadmin@gmail.com");
        if (existingAdmin.isPresent()) {
            User admin = existingAdmin.get();
            admin.setPassword(passwordEncoder.encode("admin@zenve111"));
            admin.setRole("ADMIN");
            admin.setAccountStatus("ACTIVE");
            admin.setActive(true);
            admin.setFullName("DA Centre Chief Administrator");
            userRepository.save(admin);
            log.info("Official Admin credentials updated: dacentreadmin@gmail.com / admin@zenve111");
        } else {
            User admin = User.builder()
                    .customUserId("DAC-ADM-001")
                    .username("dacentreadmin@gmail.com")
                    .email("dacentreadmin@gmail.com")
                    .password(passwordEncoder.encode("admin@zenve111"))
                    .fullName("DA Centre Chief Administrator")
                    .role("ADMIN")
                    .accountStatus("ACTIVE")
                    .active(true)
                    .department("Central Administration")
                    .region("Global Headquarters")
                    .build();
            userRepository.save(admin);
            log.info("Official Admin created: dacentreadmin@gmail.com / admin@zenve111");
        }
    }
}
