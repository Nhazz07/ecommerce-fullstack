package com.example.animeecommercebackend.Client;

import com.example.animeecommercebackend.Config.TelegramProperties;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class TelegramClient {

    private final TelegramProperties properties;
    private final RestClient restClient;

    public TelegramClient(TelegramProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }


    public void sendMessage(String message) {

        String url = "https://api.telegram.org/bot"
                + properties.token()
                + "/sendMessage";

        Map<String, Object> requestBody = Map.of(
                "chat_id", properties.chatId(),
                "text", message
        );

        Map<?, ?> response = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        if (response == null || !Boolean.TRUE.equals(response.get("ok"))) {
            throw new IllegalStateException(
                    "Telegram did not confirm message delivery."
            );
        }
    }

}

