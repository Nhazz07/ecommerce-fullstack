package com.example.animeecommercebackend.Dto.Response;

import com.example.animeecommercebackend.Entity.Enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {

    private Long id;
    private Integer orderNumber;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private BigDecimal subTotal;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private Long userId;
    private List<Long> productVariantIds;
    private List<OrderItemResponseDto> orderItems;
    private Long couponId;
    private Long paymentId;
    private Long shipmentId;
    private List<Long> returnsId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;



}
