package com.skillswap.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration for the SkillSwap backend API.
 *
 * <p><strong>Development:</strong> Uses {@code allowedOriginPatterns("*")} so the
 * React dev server on any port can reach the API without extra config.</p>
 *
 * <p><strong>Production:</strong> Replace the wildcard with the actual frontend
 * origin, e.g. {@code .allowedOrigins("https://skillswap.example.com")}.</p>
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods(
                                "GET",
                                "POST",
                                "PUT",
                                "PATCH",
                                "DELETE",
                                "OPTIONS"
                        )
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}