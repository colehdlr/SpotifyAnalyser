package com.spotifyanalyzer.backend.controller;

import com.spotifyanalyzer.backend.dto.SpotifyAuthResponse;
import com.spotifyanalyzer.backend.authservice.SpotifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
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
        String authUrl = spotifyService.getAuthorisationUrl();
        //System.out.println("generated spotify auth URL: " + authUrl);
        return ResponseEntity.ok(Map.of("authUrl", authUrl));
    }

    @PostMapping("/token-exchange")
    public ResponseEntity<?> exchangeToken(@RequestParam String code, HttpSession session) {
        try {
            //System.out.println("received token exchange request with code: " + code.substring(0, 5) + "...");

            // exchange our code for the token
            SpotifyAuthResponse authResponse = spotifyService.exchangeCodeForToken(code);

            System.out.println("Token exchange successful!");

            // store the retrieved token in our sesesion
            session.setAttribute("spotify_access_token", authResponse.getAccessToken());
            session.setAttribute("spotify_refresh_token", authResponse.getRefreshToken());

            // find our token expiry time
            long expiryTime = System.currentTimeMillis() + (authResponse.getExpiresIn() * 1000);
            session.setAttribute("spotify_token_expiry", expiryTime);

            //System.out.println("Session ID: " + session.getId());
            System.out.println("Token stored in session");

            // create response with token details
            Map<String, Object> response = new HashMap<>();
            response.put("access_token", authResponse.getAccessToken());
            response.put("expires_in", authResponse.getExpiresIn());
            response.put("token_type", authResponse.getTokenType());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("token exchange error: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "authentication_failed",
                            "message", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> checkAuthStatus(HttpSession session) {
        String accessToken = (String) session.getAttribute("spotify_access_token");
        //System.out.println("Checking auth status. Session ID: " + session.getId());
        //System.out.println("Access token present: " + (accessToken != null));

        if (accessToken != null) {
            try {
                Map<String, Object> profile = spotifyService.getUserProfile(accessToken);
                return ResponseEntity.ok(Map.of(
                        "authenticated", true,
                        "profile", profile
                ));
            } catch (Exception e) {
                System.out.println("error verifying token: " + e.getMessage());
                return ResponseEntity.ok(Map.of("authenticated", false));
            }
        }

        return ResponseEntity.ok(Map.of("authenticated", false));
    }

    // add some actual endpoints that we know the spotify API has. these are what are called from our frontend feel free to add more
    @GetMapping("/data/top-artists")
    public ResponseEntity<?> getTopArtists(
            @RequestParam(value = "time_range", defaultValue = "medium_term") String timeRange,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            HttpSession session) {

        String accessToken = (String) session.getAttribute("spotify_access_token");

        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "not authenticated with Spotify"));
        }

        try {
            // check if token is expired
            Long expiryTime = (Long) session.getAttribute("spotify_token_expiry");
            if (expiryTime != null && System.currentTimeMillis() > expiryTime) {
                // token is expired so attempt a refresh
                String refreshToken = (String) session.getAttribute("spotify_refresh_token");
                if (refreshToken != null) {
                    try {
                        SpotifyAuthResponse refreshResponse = spotifyService.refreshAccessToken(refreshToken);
                        session.setAttribute("spotify_access_token", refreshResponse.getAccessToken());

                        // correct our expiry time
                        long newExpiryTime = System.currentTimeMillis() + (refreshResponse.getExpiresIn() * 1000);
                        session.setAttribute("spotify_token_expiry", newExpiryTime);

                        accessToken = refreshResponse.getAccessToken();
                        //System.out.println("Token refreshed successfully");
                    } catch (Exception e) {
                        // we can just assume they are logged out and make them log in
                        //System.out.println("failed to refresh token: " + e.getMessage());
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("error", "Authentication expired"));
                    }
                }
            }

            // making the actual request to the spotify API
            Object topArtists = spotifyService.makeSpotifyRequest(
                    "/me/top/artists?time_range=" + timeRange + "&limit=" + limit,
                    HttpMethod.GET,
                    accessToken,
                    null,
                    Object.class);

            return ResponseEntity.ok(topArtists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "failed to fetch top artists",
                            "message", e.getMessage()));
        }
    }

    // endpoint for getting the user's most listened to tracks from spotify
    @GetMapping("/data/top-tracks")
    public ResponseEntity<?> getTopTracks(
            @RequestParam(value = "time_range", defaultValue = "medium_term") String timeRange,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            HttpSession session) {

        String accessToken = (String) session.getAttribute("spotify_access_token");

        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "not authenticated with Spotify"));
        }

        try {
            // check if token needs refreshing (just same logic as above)
            // should probably refactor this??
            Long expiryTime = (Long) session.getAttribute("spotify_token_expiry");
            if (expiryTime != null && System.currentTimeMillis() > expiryTime) {
                String refreshToken = (String) session.getAttribute("spotify_refresh_token");
                if (refreshToken != null) {
                    try {
                        SpotifyAuthResponse refreshResponse = spotifyService.refreshAccessToken(refreshToken);
                        session.setAttribute("spotify_access_token", refreshResponse.getAccessToken());
                        long newExpiryTime = System.currentTimeMillis() + (refreshResponse.getExpiresIn() * 1000);
                        session.setAttribute("spotify_token_expiry", newExpiryTime);
                        accessToken = refreshResponse.getAccessToken();
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("error", "Authentication expired"));
                    }
                }
            }

            // make the request
            Object topTracks = spotifyService.makeSpotifyRequest(
                    "/me/top/tracks?time_range=" + timeRange + "&limit=" + limit,
                    HttpMethod.GET,
                    accessToken,
                    null,
                    Object.class);

            return ResponseEntity.ok(topTracks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch top tracks",
                            "message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.removeAttribute("spotify_access_token");
        session.removeAttribute("spotify_refresh_token");
        session.removeAttribute("spotify_token_expiry");
        return ResponseEntity.ok().build();
    }
}