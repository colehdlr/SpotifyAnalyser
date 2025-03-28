package com.spotifyanalyzer.backend.controller;

import com.spotifyanalyzer.backend.dto.SpotifyAuthResponse;
import com.spotifyanalyzer.backend.authservice.SpotifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.HttpSession;
import java.util.Date;
import java.util.HashMap;
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
        System.out.println("Generated Spotify auth URL: " + authUrl);
        return ResponseEntity.ok(Map.of("authUrl", authUrl));
    }

    @GetMapping("/callback")
    public RedirectView handleCallback(
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String state,
            HttpSession session) {

        try {
            System.out.println("Received callback with code: " + code.substring(0, 5) + "...");

            SpotifyAuthResponse authResponse = spotifyService.exchangeCodeForToken(code);
            System.out.println("Token exchange successful");

            // Store tokens in session
            session.setAttribute("spotify_access_token", authResponse.getAccessToken());
            session.setAttribute("spotify_refresh_token", authResponse.getRefreshToken());
            session.setAttribute("spotify_token_expiry", System.currentTimeMillis() + (authResponse.getExpiresIn() * 1000));

            System.out.println("Redirecting to frontend: http://localhost:3000/home");
            // Redirect to frontend home page
            return new RedirectView("http://localhost:3000/home");
        } catch (Exception e) {
            System.err.println("Error in callback: " + e.getMessage());
            e.printStackTrace();

            // Redirect to frontend with error
            return new RedirectView("http://localhost:3000/home?error=auth_failed");
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> checkAuthStatus(HttpSession session) {
        String accessToken = (String) session.getAttribute("spotify_access_token");
        System.out.println("Checking auth status. Session ID: " + session.getId());
        System.out.println("Access token present: " + (accessToken != null));

        if (accessToken != null) {
            // Check if token is expired
            Long expiryTime = (Long) session.getAttribute("spotify_token_expiry");

            if (expiryTime != null && System.currentTimeMillis() > expiryTime) {
                System.out.println("Token expired, attempting refresh");
                String refreshToken = (String) session.getAttribute("spotify_refresh_token");

                if (refreshToken != null) {
                    try {
                        SpotifyAuthResponse refreshResponse = spotifyService.refreshAccessToken(refreshToken);
                        System.out.println("Token refresh successful");

                        // Update session with new token info
                        session.setAttribute("spotify_access_token", refreshResponse.getAccessToken());
                        session.setAttribute("spotify_token_expiry",
                                System.currentTimeMillis() + (refreshResponse.getExpiresIn() * 1000));

                        accessToken = refreshResponse.getAccessToken();
                    } catch (Exception e) {
                        System.err.println("Token refresh failed: " + e.getMessage());
                        return ResponseEntity.ok(Map.of("authenticated", false));
                    }
                } else {
                    System.out.println("No refresh token available");
                    return ResponseEntity.ok(Map.of("authenticated", false));
                }
            }

            // Verify token by getting user profile
            try {
                System.out.println("Verifying token by fetching user profile");
                Map<String, Object> profile = spotifyService.getUserProfile(accessToken);
                System.out.println("User profile fetch successful");
                return ResponseEntity.ok(Map.of(
                        "authenticated", true,
                        "profile", profile
                ));
            } catch (Exception e) {
                System.err.println("Error fetching user profile: " + e.getMessage());
                return ResponseEntity.ok(Map.of("authenticated", false));
            }
        }

        System.out.println("No access token found, user is not authenticated");
        return ResponseEntity.ok(Map.of("authenticated", false));
    }

    @GetMapping("/data/top-artists")
    public ResponseEntity<?> getTopArtists(
            @RequestParam(value = "time_range", defaultValue = "medium_term") String timeRange,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            HttpSession session) {

        System.out.println("Top artists request. Time range: " + timeRange + ", Limit: " + limit);
        String accessToken = (String) session.getAttribute("spotify_access_token");

        if (accessToken == null) {
            System.out.println("No access token found for top artists request");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated with Spotify"));
        }

        // Check if token is expired and refresh if needed
        Long expiryTime = (Long) session.getAttribute("spotify_token_expiry");
        if (expiryTime != null && System.currentTimeMillis() > expiryTime) {
            System.out.println("Token expired, attempting refresh for top artists request");
            String refreshToken = (String) session.getAttribute("spotify_refresh_token");
            if (refreshToken != null) {
                try {
                    SpotifyAuthResponse refreshResponse = spotifyService.refreshAccessToken(refreshToken);
                    accessToken = refreshResponse.getAccessToken();

                    // Update session
                    session.setAttribute("spotify_access_token", accessToken);
                    session.setAttribute("spotify_token_expiry",
                            System.currentTimeMillis() + (refreshResponse.getExpiresIn() * 1000));

                    System.out.println("Token refresh successful for top artists request");
                } catch (Exception e) {
                    System.err.println("Token refresh failed for top artists: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "Failed to refresh token"));
                }
            } else {
                System.out.println("No refresh token available for top artists request");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "No refresh token available"));
            }
        }

        try {
            System.out.println("Making Spotify API request for top artists");
            // Make the API call to get top artists
            Object topArtists = spotifyService.makeSpotifyRequest(
                    "/me/top/artists?time_range=" + timeRange + "&limit=" + limit,
                    HttpMethod.GET,
                    accessToken,
                    null,
                    Object.class);

            System.out.println("Top artists request successful");
            return ResponseEntity.ok(topArtists);
        } catch (Exception e) {
            System.err.println("Error fetching top artists: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch top artists", "message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        System.out.println("Logging out user. Session ID: " + session.getId());
        session.removeAttribute("spotify_access_token");
        session.removeAttribute("spotify_refresh_token");
        session.removeAttribute("spotify_token_expiry");
        return ResponseEntity.ok().build();
    }
}