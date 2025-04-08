package com.spotifyanalyzer.backend.db_operations.artist;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ArtistRepository extends MongoRepository<Artist, String> {

    // Custom query to find artists by their name
    Artist findByArtistName(String artistName);

}

