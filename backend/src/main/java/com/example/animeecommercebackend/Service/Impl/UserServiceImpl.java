package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.UserRequestDto;
import com.example.animeecommercebackend.Dto.Request.UserStatusRequestDto;
import com.example.animeecommercebackend.Dto.Response.UserResponseDto;
import com.example.animeecommercebackend.Entity.Enums.UserRole;
import com.example.animeecommercebackend.Entity.Enums.UserStatus;
import com.example.animeecommercebackend.Entity.User;
import com.example.animeecommercebackend.Exception.BusinessConflictException;
import com.example.animeecommercebackend.Exception.ResourceNotFoundException;
import com.example.animeecommercebackend.Mapper.UserMapper;
import com.example.animeecommercebackend.Repository.UserRepository;
import com.example.animeecommercebackend.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;


    @Override
    public UserResponseDto getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User Not Found"));

        return UserMapper.toResponse(user);
    }


    @Override
    public List<UserResponseDto> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(UserMapper::toResponse)
                .toList();
    }


    @Override
    public UserResponseDto updateUser(
            Long id,
            UserRequestDto dto) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User Not Found"));

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());
        User updatedUser = userRepository.save(user);

        return UserMapper.toResponse(updatedUser);
    }

    @Override
    public UserResponseDto updateUserStatus(Long id, UserStatusRequestDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found"));

        if (user.getRole() != UserRole.CUSTOMER) {
            throw new BusinessConflictException("Administrator status cannot be changed here.");
        }

        UserStatus current = user.getStatus();
        UserStatus requested = dto.getStatus();
        if (!isAllowedStatusTransition(current, requested)) {
            throw new BusinessConflictException(
                    "Cannot change customer status from " + current + " to " + requested + "."
            );
        }

        user.setStatus(requested);
        return UserMapper.toResponse(userRepository.save(user));
    }

    private boolean isAllowedStatusTransition(UserStatus current, UserStatus requested) {
        if (current == requested || current == UserStatus.BANNED || requested == UserStatus.BANNED) {
            return false;
        }

        return switch (current) {
            case ACTIVE -> requested == UserStatus.INACTIVE || requested == UserStatus.SUSPENDED;
            case INACTIVE -> requested == UserStatus.ACTIVE || requested == UserStatus.SUSPENDED;
            case SUSPENDED -> requested == UserStatus.ACTIVE || requested == UserStatus.INACTIVE;
            case BANNED -> false;
        };
    }


    @Override
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User Not Found"));

        userRepository.delete(user);
    }
}
