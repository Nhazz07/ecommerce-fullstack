package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.LoginRequestDto;
import com.example.animeecommercebackend.Dto.Request.RegisterRequestDto;
import com.example.animeecommercebackend.Dto.Response.LoginResponseDto;
import com.example.animeecommercebackend.Dto.Response.RegisterResponseDto;
import com.example.animeecommercebackend.Entity.Enums.UserRole;
import com.example.animeecommercebackend.Entity.User;
import com.example.animeecommercebackend.Mapper.RegisterMapper;
import com.example.animeecommercebackend.Security.CustomerUserDetails;
import com.example.animeecommercebackend.Security.JwtService;
import com.example.animeecommercebackend.Repository.UserRepository;
import com.example.animeecommercebackend.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    @Override
    public RegisterResponseDto register(RegisterRequestDto dto) {

        // Normalize email to avoid case/whitespace mismatches
        String email = dto.getEmail().trim().toLowerCase();

        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered!");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(dto.getUsername().trim())) {
            throw new IllegalArgumentException("Username already taken!");
        }

        // Check password confirmation
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match!");
        }

        // Convert DTO to Entity
        User user = RegisterMapper.toEntity(dto);

        // Store normalized email
        user.setEmail(email);

        // Set default role
        user.setRole(UserRole.CUSTOMER);

        // Hash password before saving
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        // Save only after all validation passes
        User savedUser = userRepository.save(user);

        // Return response DTO
        return RegisterMapper.toResponse(savedUser);
    }


    @Override
    public LoginResponseDto login(LoginRequestDto dto) {

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password!")
                );

        // Check password
        if (!passwordEncoder.matches(
                dto.getPassword(),
                user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password!");
        }

        String accessToken = jwtService.generateToken(
                new CustomerUserDetails(user));

        // For now, return basic login response + access token
        return new LoginResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                accessToken
        );
    }
}