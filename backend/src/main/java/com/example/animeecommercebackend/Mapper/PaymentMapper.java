package com.example.animeecommercebackend.Mapper;

import com.example.animeecommercebackend.Dto.Request.PaymentRequestDto;
import com.example.animeecommercebackend.Dto.Response.PaymentResponseDto;
import com.example.animeecommercebackend.Entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public static Payment toEntity(PaymentRequestDto dto
                            ){
        Payment payment = new Payment();

        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setAmount(dto.getAmount());


        return payment;
    }

    public static PaymentResponseDto toResponse(Payment payment){
        PaymentResponseDto dto = new PaymentResponseDto();

        dto.setId(payment.getId());
        dto.setTransactionId(payment.getTransactionId());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setAmount(payment.getAmount());
        dto.setCurrency(payment.getCurrency());
        dto.setStatus(payment.getStatus());
        dto.setPaidAt(payment.getPaidAt());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        dto.setQrCode(payment.getQrCode());
        dto.setExpiresAt(payment.getExpiresAt());
        if(payment.getOrder() != null){
            dto.setOrderId(payment.getOrder().getId());
        }
        return dto;
    }
}


