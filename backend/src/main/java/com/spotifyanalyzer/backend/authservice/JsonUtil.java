package com.spotifyanalyzer.backend.authservice;

import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtil {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String convertObjectToJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            System.out.println("Error converting object to JSON: " + e.getMessage());
            return null;
        }
    }
}