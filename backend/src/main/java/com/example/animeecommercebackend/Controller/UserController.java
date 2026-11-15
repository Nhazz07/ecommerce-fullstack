package com.example.animeecommercebackend.Controller;

import com.example.animeecommercebackend.Dto.ApiResponseDto;
import com.example.animeecommercebackend.Dto.Request.UserRequestDto;
import com.example.animeecommercebackend.Dto.Request.UserStatusRequestDto;
import com.example.animeecommercebackend.Dto.Response.UserResponseDto;
import com.example.animeecommercebackend.Entity.User;
import com.example.animeecommercebackend.Service.CurrentUserService;
import com.example.animeecommercebackend.Service.Impl.UserServiceImpl;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@Validated
@RequiredArgsConstructor
public class UserController {

    private final UserServiceImpl userServiceImpl;
    private final CurrentUserService currentUserService;

    // Customer controller
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<UserResponseDto>> getMyProfile(){
        User currentUser = currentUserService.getCurrentUser();

        UserResponseDto user = userServiceImpl.getUserById(currentUser.getId());

        ApiResponseDto<UserResponseDto> response = new ApiResponseDto<>(
                true,
                "Current user retrieved successfully",
                user
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<UserResponseDto>> updateProfile(@RequestBody @Valid UserRequestDto dto){
        User currentUser = currentUserService.getCurrentUser();

        UserResponseDto user = userServiceImpl.updateUser(currentUser.getId(), dto);

        ApiResponseDto<UserResponseDto> response = new ApiResponseDto<>(
                true,
                "Profile update successfully!",
                user
        );
        return ResponseEntity.ok(response);
    }

    // Admin Controller

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<UserResponseDto>> getUserById(
            @PathVariable @Positive Long id) {

        UserResponseDto user =
                userServiceImpl.getUserById(id);

        ApiResponseDto<UserResponseDto> response =
                new ApiResponseDto<>(
                        true,
                        "User Retrieved Successfully",
                        user
                );

        return ResponseEntity.ok(response);
    }


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<List<UserResponseDto>>> getAllUsers() {

        List<UserResponseDto> users =
                userServiceImpl.getAllUsers();

        ApiResponseDto<List<UserResponseDto>> response =
                new ApiResponseDto<>(
                        true,
                        "Users Retrieved Successfully",
                        users
                );

        return ResponseEntity.ok(response);
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<UserResponseDto>> updateUser(
            @PathVariable @Positive Long id,
            @RequestBody @Valid UserRequestDto dto) {

        UserResponseDto user =
                userServiceImpl.updateUser(id, dto);

        ApiResponseDto<UserResponseDto> response =
                new ApiResponseDto<>(
                        true,
                        "User Updated Successfully",
                        user
                );

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<UserResponseDto>> updateUserStatus(
            @PathVariable @Positive Long id,
            @RequestBody @Valid UserStatusRequestDto dto) {
        UserResponseDto user = userServiceImpl.updateUserStatus(id, dto);
        return ResponseEntity.ok(new ApiResponseDto<>(
                true,
                "User status updated successfully",
                user
        ));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDto<Void>> deleteUser(
            @PathVariable @Positive Long id) {

        userServiceImpl.deleteUser(id);

        ApiResponseDto<Void> response =
                new ApiResponseDto<>(
                        true,
                        "User Deleted Successfully",
                        null
                );

        return ResponseEntity.ok(response);
    }
}
