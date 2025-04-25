package com.spotifyanalyzer.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for testing
                .csrf(csrf -> csrf.disable())
                // Permit all requests
                .authorizeHttpRequests(authorize ->
                        authorize.anyRequest().permitAll()
                )
                // Disable basic authentication
                .httpBasic(httpBasic -> httpBasic.disable())
                // Disable form login
                .formLogin(formLogin -> formLogin.disable())
                .cors();

        return http.build();
    }

    @Configuration
    public static class SecurityConfig implements WebMvcConfigurer {

        @Bean
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }

        // Globally configure CORS with CorsFilter
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**")
                    .allowedOrigins("https://spotifyanalyser.onrender.com") // Allow your frontend origin
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
        }

        @Bean
        public CorsFilter corsFilter() {
            CorsConfiguration corsConfig = new CorsConfiguration();
            corsConfig.addAllowedOrigin("https://spotifyanalyser.onrender.com"); // Allow your frontend origin
            corsConfig.addAllowedMethod("GET");
            corsConfig.addAllowedMethod("POST");
            corsConfig.addAllowedMethod("PUT");
            corsConfig.addAllowedMethod("DELETE");
            corsConfig.addAllowedHeader("*");
            corsConfig.setAllowCredentials(true);

            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", corsConfig);
            return new CorsFilter(source);
        }
    }
}
