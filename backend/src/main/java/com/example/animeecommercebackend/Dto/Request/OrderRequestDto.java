
package com.example.animeecommercebackend.Dto.Request;

import com.example.animeecommercebackend.Entity.Enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDto {

    private Long couponId;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private PaymentMethod paymentMethod;

    @NotEmpty(message = "At least one order item is required")
    @Valid
    private List<OrderItemRequestDto> orderItems;
}
