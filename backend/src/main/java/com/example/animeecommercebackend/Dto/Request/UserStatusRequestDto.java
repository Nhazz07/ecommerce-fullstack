package com.example.animeecommercebackend.Dto.Request;

import com.example.animeecommercebackend.Entity.Enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusRequestDto {

    @NotNull(message = "User status is required")
    private UserStatus status;
}
