package com.spotifyanalyzer.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
        @Value("${cors.allowed-origins}")      String origins,
        @Value("${cors.allowed-methods}")      String methods,
        @Value("${cors.allowed-headers}")      String headers,
        @Value("${cors.allow-credentials}")    boolean allowCredentials,
        @Value("${cors.max-age}")              long maxAge
    ) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(origins.split(",")));
        config.setAllowedMethods(List.of(methods.split(",")));
        config.setAllowedHeaders(List.of(headers.split(",")));
        config.setAllowCredentials(allowCredentials);
        config.setMaxAge(maxAge);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
