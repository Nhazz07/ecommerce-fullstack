package com.example.animeecommercebackend.Service;

import com.example.animeecommercebackend.Dto.Request.PaymentRequestDto;
import com.example.animeecommercebackend.Dto.Response.PaymentResponseDto;
import com.example.animeecommercebackend.Entity.Enums.PaymentStatus;
import java.math.BigDecimal;

import java.util.List;

public interface PaymentService {
    PaymentResponseDto creatPayment(PaymentRequestDto dto);
    PaymentResponseDto getPaymentById(Long id);
    PaymentResponseDto getPaymentByOrderId(Long orderId);
    List<PaymentResponseDto> getAllPayment();
    PaymentResponseDto updatePaymentStatus(Long id, PaymentStatus status);

    PaymentResponseDto completeVerifiedPayment(
            Long id,
            String providerTransactionId,
            BigDecimal verifiedAmount,
            String verifiedCurrency
    );
//    PaymentResponseDto updatePayment(Long id, PaymentRequestDto dto);
//    void deletePayment(Long id);
}
