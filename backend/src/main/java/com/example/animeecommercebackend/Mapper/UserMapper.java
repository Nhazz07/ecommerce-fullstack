package com.example.animeecommercebackend.Mapper;

import com.example.animeecommercebackend.Dto.Request.UserRequestDto;
import com.example.animeecommercebackend.Dto.Response.UserResponseDto;
import com.example.animeecommercebackend.Entity.User;

public class UserMapper {

    public static User toEntity(UserRequestDto dto) {

        User user = new User();

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());

        return user;
    }

    public static UserResponseDto toResponse(User user) {

        UserResponseDto dto = new UserResponseDto();

        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
