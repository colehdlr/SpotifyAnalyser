package com.spotifyanalyzer.backend.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spotifyanalyzer.backend.model.User;
import com.spotifyanalyzer.backend.service.UserService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://192.168.254.128:3000", allowCredentials = "true")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getStatus() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "Server is running");
        response.put("timestamp", new Date().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/user/create")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user.getUsername(), user.getPassword());
        return ResponseEntity.ok(createdUser);
    }

    @PostMapping("/user/login")
    public ResponseEntity<Map<String, String>> loginUser(@RequestBody User user) {
        boolean isValid = userService.loginUser(user.getUsername(), user.getPassword());
        Map<String, String> response = new HashMap<>();
        if (isValid) {
            response.put("status", "success");
            response.put("message", "Login successful");
        } else {
            response.put("status", "failure");
            response.put("message", "Invalid username or password");
        }
        return ResponseEntity.ok(response);
    }
}
