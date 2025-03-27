package com.spotifyanalzer.backend.authservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spotifyanalzer.backend.config.SpotifyConfig;
import com.spotifyanalzer.backend.dto.SpotifyAuthResponse;
import com.spotifyanalzer.backend.exception.SpotifyAuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SpotifyService {

    private final SpotifyConfig spotifyConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public SpotifyService(SpotifyConfig spotifyConfig, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.spotifyConfig = spotifyConfig;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * generate the authentication url for spotify
     */
    public String getAuthorizationUrl() {
        List<String> scopes = Arrays.asList(
                "user-read-private",
                "user-read-email",
                "user-top-read"
                // Add other scopes as needed
        );

        String state = generateRandomString(16);

        String scopeParam = String.join(" ", scopes);

        return String.format(
                "https://accounts.spotify.com/authorize?response_type=code&client_id=%s&scope=%s&redirect_uri=%s&state=%s",
                spotifyConfig.getClientId(),
                scopeParam,
                spotifyConfig.getRedirectUri(),
                state
        );
    }

    /**
     * exchange our apps authorisation code for the authentication and refresh token (see https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens)
     */
    public SpotifyAuthResponse exchangeCodeForToken(String code) {
        HttpHeaders headers = createBasicAuthHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", spotifyConfig.getRedirectUri());

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<SpotifyAuthResponse> response = restTemplate.exchange(
                "https://accounts.spotify.com/api/token",
                HttpMethod.POST,
                entity,
                SpotifyAuthResponse.class
        );

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new SpotifyAuthException("Failed to exchange code for token");
        }

        return response.getBody();
    }

    /**
     * refresh the expired access token using the refresh token (see https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens)
     */
    public SpotifyAuthResponse refreshAccessToken(String refreshToken) {
        HttpHeaders headers = createBasicAuthHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "refresh_token");
        body.add("refresh_token", refreshToken);

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<SpotifyAuthResponse> response = restTemplate.exchange(
                "https://accounts.spotify.com/api/token",
                HttpMethod.POST,
                entity,
                SpotifyAuthResponse.class
        );

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new SpotifyAuthException("Failed to refresh access token");
        }

        return response.getBody();
    }

    /**
     * gets the current user's Spotify profile
     */
    public Map<String, Object> getUserProfile(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.spotify.com/v1/me",
                HttpMethod.GET,
                entity,
                Map.class
        );

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new SpotifyAuthException("Failed to fetch user profile");
        }

        return response.getBody();
    }

    /**
     * create base64 (based64) http headers for the client credentials
     */
    private HttpHeaders createBasicAuthHeaders() {
        String credentials = spotifyConfig.getClientId() + ":" + spotifyConfig.getClientSecret();
        String encodedCredentials = Base64.getEncoder()
                .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Basic " + encodedCredentials);
        return headers;
    }

    /**
     * create a random string to parse as the state
     */
    private String generateRandomString(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder result = new StringBuilder(length);
        Random random = new Random();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(characters.length());
            result.append(characters.charAt(index));
        }

        return result.toString();
    }

    /**
     * makes a general request to the api given a specific endpoint e.g artist, playlist etc
     */
    public <T> T makeSpotifyRequest(String endpoint, HttpMethod method, String accessToken,
                                    Object requestBody, Class<T> responseType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<?> entity = requestBody != null ?
                new HttpEntity<>(requestBody, headers) :
                new HttpEntity<>(headers);

        ResponseEntity<T> response = restTemplate.exchange(
                "https://api.spotify.com/v1" + endpoint,
                method,
                entity,
                responseType
        );

        return response.getBody();
    }