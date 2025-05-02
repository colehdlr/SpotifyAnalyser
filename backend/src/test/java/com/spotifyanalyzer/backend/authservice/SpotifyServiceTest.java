package com.spotifyanalyzer.backend.authservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spotifyanalyzer.backend.config.SpotifyConfig;
import com.spotifyanalyzer.backend.dto.SpotifyAuthResponse;
import com.spotifyanalyzer.backend.exceptions.SpotifyAuthException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SpotifyServiceTest {

    @Mock
    private SpotifyConfig spotifyConfig;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    private SpotifyService spotifyService;

    @Value("${page.address}")
    private String pageAddress;

    @BeforeEach
    void setUp() {
        spotifyService = new SpotifyService(spotifyConfig, restTemplate, objectMapper);

        // prevents the "unnecessary stubbing" errors when running mvn test
        lenient().when(spotifyConfig.getClientId()).thenReturn("test-client-id");
        lenient().when(spotifyConfig.getClientSecret()).thenReturn("test-client-secret");
        lenient().when(spotifyConfig.getRedirectUri()).thenReturn("http://localhost:3000/callback");
    }

    @Test
    void testGetAuthorisationUrl() {
        String authUrl = spotifyService.getAuthorisationUrl();
        System.out.println("Generated Auth URL: " + authUrl);

        assertTrue(authUrl.startsWith("https://accounts.spotify.com/authorize?response_type=code"));
        assertTrue(authUrl.contains("client_id=test-client-id"));
        assertTrue(authUrl.contains("redirect_uri="+pageAddress+"/callback"));
    }

    @Test
    void testExchangeCodeForToken() {
        String testCode = "test-auth-code";
        SpotifyAuthResponse expectedResponse = new SpotifyAuthResponse();
        expectedResponse.setAccessToken("test-access-token");
        expectedResponse.setTokenType("Bearer");

        ResponseEntity<SpotifyAuthResponse> responseEntity = ResponseEntity.ok(expectedResponse);

        when(restTemplate.exchange(
                anyString(),
                any(HttpMethod.class),
                any(HttpEntity.class),
                eq(SpotifyAuthResponse.class)
        )).thenReturn(responseEntity);

        SpotifyAuthResponse actualResponse = spotifyService.exchangeCodeForToken(testCode);

        assertEquals(expectedResponse.getAccessToken(), actualResponse.getAccessToken());
        assertEquals(expectedResponse.getTokenType(), actualResponse.getTokenType());
    }

    @Test
    void testExchangeCodeForToken_Error() {
        String testCode = "invalid-code";

        when(restTemplate.exchange(
                anyString(),
                any(HttpMethod.class),
                any(HttpEntity.class),
                eq(SpotifyAuthResponse.class)
        )).thenThrow(new SpotifyAuthException("Test error message"));

        assertThrows(
                SpotifyAuthException.class,
                () -> spotifyService.exchangeCodeForToken(testCode)
        );
    }

    @Test
    void testRefreshAccessToken() {
        String refreshToken = "test-refresh-token";
        SpotifyAuthResponse expectedResponse = new SpotifyAuthResponse();
        expectedResponse.setAccessToken("new-access-token");

        ResponseEntity<SpotifyAuthResponse> responseEntity = ResponseEntity.ok(expectedResponse);

        when(restTemplate.exchange(
                anyString(),
                any(HttpMethod.class),
                any(HttpEntity.class),
                eq(SpotifyAuthResponse.class)
        )).thenReturn(responseEntity);

        SpotifyAuthResponse actualResponse = spotifyService.refreshAccessToken(refreshToken);

        assertEquals(expectedResponse.getAccessToken(), actualResponse.getAccessToken());
    }

    @Test
    void testRefreshAccessToken_Error() {
        String refreshToken = "invalid-refresh-token";

        when(restTemplate.exchange(
                anyString(),
                any(HttpMethod.class),
                any(HttpEntity.class),
                eq(SpotifyAuthResponse.class)
        )).thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST));

        SpotifyAuthException exception = assertThrows(
                SpotifyAuthException.class,
                () -> spotifyService.refreshAccessToken(refreshToken)
        );

    }

    @Test
    void testGetUserProfile() {
        String accessToken = "valid-access-token";
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", "user123");
        userData.put("display_name", "Test User");

        ResponseEntity<Map> responseEntity = ResponseEntity.ok(userData);

        when(restTemplate.exchange(
                anyString(),
                any(HttpMethod.class),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        Map<String, Object> actualUserData = spotifyService.getUserProfile(accessToken);

        assertEquals(userData, actualUserData);
    }

    @Test
    void testGetUserProfile_Error() {
        String accessToken = "invalid-access-token";

        when(restTemplate.exchange(
                anyString(),
                any(HttpMethod.class),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST));

        SpotifyAuthException exception = assertThrows(
                SpotifyAuthException.class,
                () -> spotifyService.getUserProfile(accessToken)
        );
    }

    @Test
    void testMakeSpotifyRequest() {
        String accessToken = "valid-access-token";
        String endpoint = "/artists/123";
        Map<String, Object> expectedResponse = new HashMap<>();
        expectedResponse.put("name", "Artist Name");

        ResponseEntity<Map> responseEntity = ResponseEntity.ok(expectedResponse);

        when(restTemplate.exchange(
                anyString(),
                any(HttpMethod.class),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        Map actualResponse = spotifyService.makeSpotifyRequest(endpoint, HttpMethod.GET, accessToken, null, Map.class);

        assertEquals(expectedResponse, actualResponse);
    }
}