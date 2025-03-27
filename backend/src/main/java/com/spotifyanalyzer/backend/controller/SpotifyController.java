package com.spotifyanalyzer.backend.controller;

import com.spotifyanalyzer.backend.dto.SpotifyAuthResponse;
import com.spotifyanalyzer.backend.dto.SpotifyCallbackRequest;
import com.spotifyanalyzer.backend.authservice.SpotifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.spotifyanalyzer.backend.dto.SpotifyAuthResponse;
import com.spotifyanalyzer.backend.dto.SpotifyCallbackRequest;
import com.spotifyanalyzer.backend.dto.SpotifyErrorResponse;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping("/api/spotify")
public class SpotifyController {

    private final SpotifyService spotifyService;

    @Autowired
    public SpotifyController(SpotifyService spotifyService) {
        this.spotifyService = spotifyService;
    }

    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> getAuthUrl() {
        String authUrl = spotifyService.getAuthorizationUrl();
        return ResponseEntity.ok(Map.of("authUrl", authUrl));
    }

    @PostMapping("/callback")
    public ResponseEntity<Map<String, Boolean>> handleCallback(
            @RequestBody SpotifyCallbackRequest request,
            HttpSession session) {

        try {
            SpotifyAuthResponse authResponse = spotifyService.exchangeCodeForToken(request.getCode());

            // store the retrieved tokens into the session
            session.setAttribute("spotify_access_token", authResponse.getAccessToken());
            session.setAttribute("spotify_refresh_token", authResponse.getRefreshToken());
            session.setAttribute("spotify_token_expiry", System.currentTimeMillis() + (authResponse.getExpiresIn() * 1000));

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> checkAuthStatus(HttpSession session) {
        String accessToken = (String) session.getAttribute("spotify_access_token");

        if (accessToken != null) {
            // check expired
            Long expiryTime = (Long) session.getAttribute("spotify_token_expiry");

            if (expiryTime != null && System.currentTimeMillis() > expiryTime) {
                // if expired then refresh it
                String refreshToken = (String) session.getAttribute("spotify_refresh_token");

                if (refreshToken != null) {
                    try {
                        SpotifyAuthResponse refreshResponse = spotifyService.refreshAccessToken(refreshToken);

                        // Update session with new token info
                        session.setAttribute("spotify_access_token", refreshResponse.getAccessToken());
                        session.setAttribute("spotify_token_expiry",
                                System.currentTimeMillis() + (refreshResponse.getExpiresIn() * 1000));

                        accessToken = refreshResponse.getAccessToken();
                    } catch (Exception e) {
                        // if it cant refresh for any reason we can just consider the user unauthenticated
                        return ResponseEntity.ok(Map.of("authenticated", false));
                    }
                } else {
                    return ResponseEntity.ok(Map.of("authenticated", false));
                }
            }

            // get user profile with valid token
            try {
                Map<String, Object> profile = spotifyService.getUserProfile(accessToken);
                return ResponseEntity.ok(Map.of(
                        "authenticated", true,
                        "profile", profile
                ));
            } catch (Exception e) {
                return ResponseEntity.ok(Map.of("authenticated", false));
            }
        }

        return ResponseEntity.ok(Map.of("authenticated", false));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.removeAttribute("spotify_access_token");
        session.removeAttribute("spotify_refresh_token");
        session.removeAttribute("spotify_token_expiry");
        return ResponseEntity.ok().build();
    }
}