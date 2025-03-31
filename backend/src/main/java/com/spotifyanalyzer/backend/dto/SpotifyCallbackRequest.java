package com.spotifyanalyzer.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SpotifyCallbackRequest {
    private String code;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}