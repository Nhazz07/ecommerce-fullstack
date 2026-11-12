package com.example.animeecommercebackend.Dto.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BakongPaymentResponse(
        Long paymentId,
        String transactionId,
        String qrCode,
        String currency,
        BigDecimal amount,
        LocalDateTime expiredAt,
        String status
) {


}
