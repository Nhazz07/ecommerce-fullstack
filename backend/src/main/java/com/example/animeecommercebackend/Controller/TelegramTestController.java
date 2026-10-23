package com.example.animeecommercebackend.Controller;

import com.example.animeecommercebackend.Client.TelegramClient;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test/telegram")
@RequiredArgsConstructor

public class TelegramTestController {

    private final TelegramClient telegramClient;

    @PostMapping
    public String sendTestMessage(){
        telegramClient.sendMessage(" ANTEIKU TEST\n\n" +
                "Your Telegram bot is connected to Spring Boot!");

        return "Telegram test message sent";
    }
}
