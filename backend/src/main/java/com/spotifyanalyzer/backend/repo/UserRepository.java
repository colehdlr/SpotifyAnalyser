package com.spotifyanalyzer.backend.repo;

import com.spotifyanalyzer.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    User findByUsername(String username);
}