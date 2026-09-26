package com.veterinary.research;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class VeterinaryResearchApplication {

    public static void main(String[] args) {
        SpringApplication.run(VeterinaryResearchApplication.class, args);
    }
}
