package com.example.animeecommercebackend.Dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDto {

    private Long couponId;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;
}