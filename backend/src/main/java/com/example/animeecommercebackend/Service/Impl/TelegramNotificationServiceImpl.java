package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Client.TelegramClient;
import com.example.animeecommercebackend.Service.TelegramNotificationService;

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
}
