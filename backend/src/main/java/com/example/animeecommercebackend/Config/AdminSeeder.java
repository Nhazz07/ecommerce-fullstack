package com.example.animeecommercebackend.Config;

import com.example.animeecommercebackend.Entity.Enums.UserRole;
import com.example.animeecommercebackend.Entity.Enums.UserStatus;
import com.example.animeecommercebackend.Entity.User;
import com.example.animeecommercebackend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Configuration
@RequiredArgsConstructor
public class AdminSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD}")
    private String adminPassword;

    @Value("${ADMIN_FIRST_NAME}")
    private String adminFirstName;

    @Value("ADMIN_LAST_NAME")
    private String adminLastName;

    @Value("ADMIN_USERNAME")
    private String adminUsername;

    @Value("ADMIN_PHONE_NUMBER")
    private String adminPhoneNumber;

    @Bean
    public CommandLineRunner createAdmin(){
        return args -> {
            String normalizedEmail = adminEmail.trim().toLowerCase(Locale.ROOT);

            if(normalizedEmail.isBlank() || adminPassword.isBlank()){
                throw new IllegalArgumentException("Admin email and password must not be blank");
            }
            if(userRepository.findByEmail(normalizedEmail).isPresent()){
                return;
            }

            User admin = new User();

            admin.setEmail(normalizedEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setFirstName(adminFirstName);
            admin.setLastName(adminLastName);
            admin.setUsername(adminUsername);
            admin.setRole(UserRole.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);

            userRepository.save(admin);
        };
    }

}
