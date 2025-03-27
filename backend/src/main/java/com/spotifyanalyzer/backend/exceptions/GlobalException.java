package com.spotifyanalyzer.backend.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalException {

    private static final Logger logger = LoggerFactory.getLogger(GlobalException.class);

    @ExceptionHandler(SpotifyAuthException.class)
    public ResponseEntity<Map<String, Object>> handleSpotifyAuthException(SpotifyAuthException e) {
        logger.error("Spotify authentication error: {}", e.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", "authentication_error");
        response.put("message", "Failed to authenticate with Spotify");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<Map<String, Object>> handleHttpClientErrorException(HttpClientErrorException e) {
        logger.error("HTTP client error: {}", e.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", "spotify_api_error");
        response.put("status", e.getStatusCode().value());
        response.put("message", "Error communicating with Spotify API");

        return ResponseEntity.status(e.getStatusCode()).body(response);
    }

    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<Map<String, Object>> handleRestClientException(RestClientException e) {
        logger.error("REST client error: {}", e.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", "service_unavailable");
        response.put("message", "Unable to connect to Spotify services");

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception e) {
        logger.error("Unexpected error: {}", e.getMessage(), e);

        Map<String, Object> response = new HashMap<>();
        response.put("error", "internal_server_error");
        response.put("message", "An unexpected error occurred");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}