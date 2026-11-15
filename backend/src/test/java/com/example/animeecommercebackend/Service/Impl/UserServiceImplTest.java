package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.UserStatusRequestDto;
import com.example.animeecommercebackend.Entity.Enums.UserRole;
import com.example.animeecommercebackend.Entity.Enums.UserStatus;
import com.example.animeecommercebackend.Entity.User;
import com.example.animeecommercebackend.Exception.BusinessConflictException;
import com.example.animeecommercebackend.Repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserServiceImplTest {

    @Test
    void changesCustomerStatusThroughAllowedTransition() {
        UserRepository users = mock(UserRepository.class);
        User customer = customer(UserStatus.ACTIVE);
        when(users.findById(7L)).thenReturn(Optional.of(customer));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserServiceImpl service = new UserServiceImpl(users);
        var response = service.updateUserStatus(7L, new UserStatusRequestDto(UserStatus.SUSPENDED));

        assertEquals(UserStatus.SUSPENDED, response.getStatus());
    }

    @Test
    void refusesStatusChangesForAdministrators() {
        UserRepository users = mock(UserRepository.class);
        User admin = customer(UserStatus.ACTIVE);
        admin.setRole(UserRole.ADMIN);
        when(users.findById(7L)).thenReturn(Optional.of(admin));

        UserServiceImpl service = new UserServiceImpl(users);

        assertThrows(BusinessConflictException.class, () ->
                service.updateUserStatus(7L, new UserStatusRequestDto(UserStatus.INACTIVE))
        );
    }

    @Test
    void refusesBannedStatusTransitions() {
        UserRepository users = mock(UserRepository.class);
        User customer = customer(UserStatus.BANNED);
        when(users.findById(7L)).thenReturn(Optional.of(customer));

        UserServiceImpl service = new UserServiceImpl(users);

        assertThrows(BusinessConflictException.class, () ->
                service.updateUserStatus(7L, new UserStatusRequestDto(UserStatus.ACTIVE))
        );
    }

    private User customer(UserStatus status) {
        User user = new User();
        user.setId(7L);
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(status);
        return user;
    }
}
