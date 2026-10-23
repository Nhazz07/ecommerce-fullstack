
package com.example.animeecommercebackend.Config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "telegram.bot")
public record TelegramProperties(
        String token,
        String chatId
) {
}
