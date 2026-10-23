package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Client.TelegramClient;
import com.example.animeecommercebackend.Service.TelegramNotificationService;

import java.math.BigDecimal;

public class TelegramNotificationServiceImpl implements TelegramNotificationService {
     private final TelegramClient telegramClient;

    public TelegramNotificationServiceImpl(TelegramClient telegramClient) {
        this.telegramClient = telegramClient;
    }

    @Override
    public void sendTestNotification() {
        String message = """
                ANTEIKU TEST NOTIFICATION
                
                Your Telegram integration is working!
                Your Spring Boot backend can now send message to Telegram
                """ ;
        telegramClient.sendMessage(message);

    }

    @Override
    public void sendOrderNotification(
            String orderNumber,
            String customerName,
            String customerPhone,
            String deliveryAddress,
            String items,
            BigDecimal total,
            String paymentMethod,
            String status
    ) {
        String message = """
             ANTEIKU — NEW ORDER

            Order: %s
            Customer: %s
            Phone: %s
            Delivery address: %s

            Items:
            %s

            Total: $%s
            Payment: %s
            Status: %s
            """.formatted(
                orderNumber,
                customerName,
                customerPhone,
                deliveryAddress,
                items,
                total,
                paymentMethod,
                status
        );

        telegramClient.sendMessage(message);
    }

}
