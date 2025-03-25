package com.spotifyanalyzer.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String password;
    public void setUsername(String username) {
        this.username = username;
    }
    public void setPassword(String encodedPassword) {
        this.password = encodedPassword;
    }
    public String getUsername() {
        return username;
    }
    public String getPassword() {
        return password;
    }
}