package com.spotifyanalyzer.backend.db_operations.user;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    // Custom query methods can be defined here if needed
    // For example, to find a user by their Spotify username:
    User findBySpotifyUsername(String spotifyUsername);

    @Query(value = "{ 'spotify_username': ?0 }")
    List<User> findAllBySpotifyUsername(String spotifyUsername);

    // Custom query to find top minigame players
    List<User> findTop5ByOrderByMinigameBestTimeInSecondsAsc();
}

