package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Dto.Request.PaymentRequestDto;
import com.example.animeecommercebackend.Dto.Response.PaymentResponseDto;
import com.example.animeecommercebackend.Entity.Enums.OrderStatus;
import com.example.animeecommercebackend.Entity.Enums.PaymentMethod;
import com.example.animeecommercebackend.Entity.Enums.PaymentStatus;
import com.example.animeecommercebackend.Entity.Order;
import com.example.animeecommercebackend.Entity.Payment;
import com.example.animeecommercebackend.Exception.ResourceNotFoundException;
import com.example.animeecommercebackend.Exception.BusinessConflictException;
import com.example.animeecommercebackend.Mapper.PaymentMapper;
import com.example.animeecommercebackend.Repository.OrderRepository;
import com.example.animeecommercebackend.Repository.PaymentRepository;
import com.example.animeecommercebackend.Service.BakongService;
import com.example.animeecommercebackend.Service.CurrentUserService;
import com.example.animeecommercebackend.Service.PaymentService;
import com.example.animeecommercebackend.Service.InventoryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import kh.gov.nbc.bakong_khqr.model.KHQRCurrency;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final CurrentUserService currentUserService;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final BakongService bakongService;

    @Override
    @Transactional
    public PaymentResponseDto creatPayment(PaymentRequestDto dto) {

        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order Not Found!"));

        Long currentUserId = currentUserService.getCurrentUser().getId();

        if (!order.getUser().getId().equals(currentUserId)) {
            throw new ResourceNotFoundException("Order Not Found!");
        }

        if (order.getPayment() != null) {
            throw new BusinessConflictException("Order already has a payment!");
        }

        BigDecimal amount = order.getTotalAmount();

        Payment payment = new Payment();
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setAmount(amount);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setOrder(order);

        if (dto.getPaymentMethod() == PaymentMethod.KHQR) {

            KHQRCurrency currency = KHQRCurrency.USD;

            KHQRResponse<KHQRData> response =
                    bakongService.generateMerchantKhqr(
                            payment.getTransactionId(),
                            amount.doubleValue(),
                            currency
                    );

            if (response == null || response.getData() == null
                    || response.getKHQRStatus() == null
                    || response.getKHQRStatus().getCode() != 0) {
                throw new BusinessConflictException("Failed to generate KHQR!");
            }

            payment.setQrCode(response.getData().getQr());
            payment.setCurrency(currency.name());
            payment.setExpiresAt(
                    LocalDateTime.now().plusMinutes(10)
            );
        }

        Payment saved = paymentRepository.save(payment);

        return PaymentMapper.toResponse(saved);
    }


    @Override
    public PaymentResponseDto getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Payment Not Found!"));

        Long currentUserId = currentUserService.getCurrentUser().getId();

        if (!payment.getOrder().getUser().getId().equals(currentUserId)) {
            throw new ResourceNotFoundException("Payment Not found");
        }
        return PaymentMapper.toResponse(payment);
    }

    @Override
    public PaymentResponseDto getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId);
        if (payment == null) {
            throw new ResourceNotFoundException("Payment Not Found!");
        }
        Long currentUserId = currentUserService.getCurrentUser().getId();

        if (!payment.getOrder().getUser().getId().equals(currentUserId)) {
            throw new ResourceNotFoundException("Payment Not Found");
        }
        return PaymentMapper.toResponse(payment);
    }

    @Override
    public List<PaymentResponseDto> getAllPayment() {
        return paymentRepository.findAll().stream().map(PaymentMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public PaymentResponseDto updatePaymentStatus(Long id, PaymentStatus status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment Not Found!"));
        if (status == PaymentStatus.PAID || status == PaymentStatus.COMPLETED) {
            throw new BusinessConflictException(
                    "Payment can only be marked paid by a verified payment-provider callback."
            );
        }
        if(payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.COMPLETED){
            throw new BusinessConflictException("Payment is already completed!");
        }
        if (status == PaymentStatus.FAILED || status == PaymentStatus.CANCELLED) {
            Order order = payment.getOrder();
            if (order.getStatus() == OrderStatus.PENDING
                    || order.getStatus() == OrderStatus.CONFIRMED) {
                inventoryService.releaseOrderStock(order);
                order.setStatus(OrderStatus.CANCELED);
                orderRepository.save(order);
            }
        }
        payment.setStatus(status);
        Payment updated = paymentRepository.save(payment);
        return PaymentMapper.toResponse(updated);
    }

    /**
     * Provider adapters must call this only after authenticating the provider
     * callback/signature and verifying the transaction server-side.
     */
    @Override
    @Transactional
    public PaymentResponseDto completeVerifiedPayment(
            Long id,
            String providerTransactionId,
            BigDecimal verifiedAmount,
            String verifiedCurrency) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment Not Found!"));

        if (payment.getStatus() == PaymentStatus.PAID
                || payment.getStatus() == PaymentStatus.COMPLETED) {
            if (providerTransactionId.equals(payment.getProviderTransactionId())) {
                return PaymentMapper.toResponse(payment);
            }
            throw new BusinessConflictException("Payment callback was already processed.");
        }
        if (!payment.getAmount().equals(verifiedAmount)
                || !payment.getCurrency().equalsIgnoreCase(verifiedCurrency)) {
            throw new BusinessConflictException("Verified payment amount or currency does not match the order.");
        }

        Order order = payment.getOrder();
        inventoryService.commitOrderStock(order);
        order.setStatus(OrderStatus.PAID);
        payment.setProviderTransactionId(providerTransactionId);
        payment.setPaidAt(LocalDateTime.now());
        payment.setStatus(PaymentStatus.PAID);
        orderRepository.save(order);
        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }
}
//    @Override
//    public PaymentResponseDto updatePayment(Long id, PaymentRequestDto dto) {
//        Payment payment = paymentRepository.findById(id).orElseThrow(() ->
//                new ResourceNotFoundException("Payment Not Found"));
//
//        payment.setAmount(dto.getAmount());
//        payment.setPaymentMethod(dto.getPaymentMethod());
//
//        Payment updated = paymentRepository.save(payment);
//        return PaymentMapper.toResponse(updated);
//    }
//
//    @Override
//    public void deletePayment(Long id) {
//        Payment payment = paymentRepository.findById(id).orElseThrow(() ->
//                new ResourceNotFoundException("Payment Not Found!!"));
//
//        paymentRepository.delete(payment);
//    }

