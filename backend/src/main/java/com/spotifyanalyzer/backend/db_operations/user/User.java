package com.spotifyanalyzer.backend.db_operations.user;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "UserCollection")
public class User {
    @Id
    private String id;

    @Field("spotify_username")
    private String spotifyUsername;

    @Field("minigame_best_time_in_seconds")
    private Long minigameBestTimeInSeconds;

    // Constructors
    public User() {}

    public User(String spotifyUsername, Long minigameBestTimeInSeconds) {
        this.spotifyUsername = spotifyUsername;
        this.minigameBestTimeInSeconds = minigameBestTimeInSeconds;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSpotifyUsername() {
        return spotifyUsername;
    }

    public void setSpotifyUsername(String spotifyUsername) {
        this.spotifyUsername = spotifyUsername;
    }

    public Long getMinigameBestTimeInSeconds() {
        return minigameBestTimeInSeconds;
    }

    public void setMinigameBestTimeInSeconds(Long minigameBestTimeInSeconds) {
        this.minigameBestTimeInSeconds = minigameBestTimeInSeconds;
    }
}
