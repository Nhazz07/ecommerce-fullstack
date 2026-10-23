package com.example.animeecommercebackend.Service;

import java.math.BigDecimal;

public interface TelegramNotificationService {
    void sendTestNotification();

    void sendOrderNotification(
            String orderNumber,
            String customerName,
            String customerPhone,
            String deliveryAddress,
            String items,
            BigDecimal total,
            String paymentMethod,
            String status
    );
}
