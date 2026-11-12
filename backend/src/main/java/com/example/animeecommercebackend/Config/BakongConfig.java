package com.example.animeecommercebackend.Config;

import com.cloudinary.Api;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "bakong")
public class BakongConfig {

    private Api api = new Api();
    private Khqr khqr = new Khqr();

    @Getter
    @Setter
    public static class Api{
        private String baseUrl;
        private String token;
    }

    @Getter
    @Setter
    public static class Khqr{
        private String accountId;
        private String merchantName;
        private String merchantCity;
        private String usdCurrency;
        private String kqrCurrency;
        private int expirationMinutes;
    }

    @PostConstruct
    public void validateConfiguration(){
        if (api.getBaseUrl() == null || api.getBaseUrl().isBlank()){
            throw new IllegalArgumentException("Bakong API URL is missing");
        }
        if(api.getToken() == null || api.getToken().isBlank()){
            throw new IllegalArgumentException("Bakong API token is missing");
        }
        if(khqr.getAccountId() == null || api.getToken().isBlank()){
            throw new IllegalArgumentException("Bakong Account ID is missing");
        }
        System.out.println("Bakong configuration loaded successfully");
    }
}


