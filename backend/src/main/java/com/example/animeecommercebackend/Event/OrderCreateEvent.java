package com.example.animeecommercebackend.Event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderCreateEvent(
        Integer orderNumber,
        LocalDateTime orderDate,
        String customerName,
        String customerPhone,
        String customerEmail,
        String shippingAddress,
        BigDecimal subTotal,
        BigDecimal discountAmount,
        BigDecimal shippingFee,
        BigDecimal totalAmount,
        String status
) {
}
