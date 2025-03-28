package com.spotifyanalyzer.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF protection for API endpoints
                .csrf(csrf -> csrf.disable())

                // Permit all requests - we're using Spotify OAuth, not Spring Security authentication
                .authorizeHttpRequests(authorize ->
                        authorize.anyRequest().permitAll()
                )

                // Completely disable HTTP Basic authentication
                .httpBasic(httpBasic -> httpBasic.disable())

                // Disable form login
                .formLogin(formLogin -> formLogin.disable())

                // Use stateful session for cookies
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
                );

        return http.build();
    }
}