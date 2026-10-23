
package com.example.animeecommercebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class AnimeEcommerceBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(
				AnimeEcommerceBackendApplication.class,
				args
		);
	}
}
