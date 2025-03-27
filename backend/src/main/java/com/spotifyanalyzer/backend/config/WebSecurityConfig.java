package com.spotifyanalyzer.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                // csrf protection with cookies
                .csrf()
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .and()
                .sessionManagement()
                .invalidSessionUrl("/")
                .and()
                // security headers
                .headers()
                .contentSecurityPolicy("default-src 'self'; connect-src 'self' https://accounts.spotify.com https://api.spotify.com; img-src 'self' https://i.scdn.co data:;")
                .and()
                .referrerPolicy(ReferrerPolicyHeaderWriter.ReferrerPolicy.SAME_ORIGIN)
                .and()
                .frameOptions().deny()
                .and()
                .authorizeRequests()
                .antMatchers("/api/spotify/login", "/api/spotify/callback").permitAll()
                .antMatchers("/api/spotify/**").authenticated()
                .and()
                // auth
                .exceptionHandling()
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"Authentication required\"}");
                })
                .and()
                // block the basic http auth as we have an alternative
                .httpBasic().disable()
                // get rid of the form login
                .formLogin().disable();
    }
}