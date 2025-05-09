package com.spotifyanalyzer.backend.authservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spotifyanalyzer.backend.config.SpotifyConfig;
import com.spotifyanalyzer.backend.dto.SpotifyAuthResponse;
import com.spotifyanalyzer.backend.exceptions.SpotifyAuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class SpotifyService {

    private final SpotifyConfig spotifyConfig;
    private final RestTemplate restTemplate;

    @Value("${page.address}")
    private String pageAddress;

    @Autowired
    public SpotifyService(SpotifyConfig spotifyConfig, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.spotifyConfig = spotifyConfig;
        this.restTemplate = restTemplate;
    }

    /**
     * generate the authentication url for spotify
     */
    public String getAuthorisationUrl() {
        List<String> scopes = Arrays.asList(
                "user-read-private",
                "user-read-email",
                "user-top-read",
                "user-read-recently-played"
        );

        String state = generateRandomString(16);
        String scopeParam = String.join(" ", scopes);

        System.out.println("client ID: " + spotifyConfig.getClientId());
        System.out.println("redirect URI: " + spotifyConfig.getRedirectUri());

        // set our redirect to the frontend callback (THIS MUST BE THE SAME AS WHATEVER IS IN SPOTIFY DASHBOARD!!!)
        String redirectUri = pageAddress+"/callback";

        String authUrl = String.format(
                "https://accounts.spotify.com/authorize?response_type=code&client_id=%s&scope=%s&redirect_uri=%s&state=%s",
                spotifyConfig.getClientId(),
                scopeParam,
                redirectUri,
                state
        );

        System.out.println("Generated Auth URL: " + authUrl);
        return authUrl;
    }

    public SpotifyAuthResponse exchangeCodeForToken(String code) {
        HttpHeaders headers = createBasicAuthHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // IMPORTANT: MUST BE THE SAME REDIRECT AS IN getAuthorisationURL!!
        String redirectUri = pageAddress+"/callback";

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", redirectUri);

        System.out.println("exchange code request - grant_type: authorization_code, redirect_uri: " + redirectUri);

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<SpotifyAuthResponse> response = restTemplate.exchange(
                    "https://accounts.spotify.com/api/token",
                    HttpMethod.POST,
                    entity,
                    SpotifyAuthResponse.class
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new SpotifyAuthException("error with the token exchange, status: " + response.getStatusCode());
            }

            SpotifyAuthResponse authResponse = response.getBody();
            if (authResponse != null) {
                System.out.println("token exchange successful. Token type: " + authResponse.getTokenType());
                System.out.println("expiry: " + authResponse.getExpiresIn() + " seconds");
            }

            return authResponse;
        } catch (Exception e) {
            System.err.println("error during token exchange: " + e.getMessage());
            throw new SpotifyAuthException("token exchange failed: " + e.getMessage(), e);
        }
    }

    /**
     * refresh the expired access token using the refresh token (see <a href="https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens">...</a>)
     */
    public SpotifyAuthResponse refreshAccessToken(String refreshToken) {
        try {
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
                throw new SpotifyAuthException("failed to refresh access token");
            }

            return response.getBody();
        }
        catch (Exception e) {
            System.err.println("error during token refresh: " + e.getMessage());
            throw new SpotifyAuthException("token refresh failed: " + e.getMessage(), e);
        }
    }

    /**
     * gets the current user's Spotify profile
     */
    public Map<String, Object> getUserProfile(String accessToken) {
        try {
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
                throw new SpotifyAuthException("failed to fetch user profile");
            }

            return response.getBody();
        }
        catch (Exception e) {
            System.err.println("error during fetching user profile: " + e.getMessage());
            throw new SpotifyAuthException("failed to fetch user profile: " + e.getMessage(), e);
        }
    }

    /**
     * create base64 http headers for the client credentials (see spotify dev documentation link above)
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
     * create a random string of given length to parse as the state
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
     * makes a general request to the api given a specific endpoint e.g. artist, playlist etc
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
}
