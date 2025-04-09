package com.spotifyanalyzer.backend.db_operations.artist;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Document(collection = "ArtistCollection")
public class Artist {
    @Id
    private String id;

    @Field("summary")
    private String summary;

    @Field("artist_name")
    private String artistName;

    @Field("update_date")
    private Date update_date;

    // Constructors
    public Artist() {}

    public Artist(String summary, String artistName, Date update_date) {
        this.summary = summary;
        this.artistName = artistName;
        this.update_date = update_date;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getSummary() {
        return summary;
    }
    public void setSummary(String summary) {
        this.summary = summary;
    }
    public String getArtistName() {
        return artistName;
    }
    public void setArtistName(String artistName) {
        this.artistName = artistName;
    }
    public Date getUpdate_date() {
        return update_date;
    }
    public void setUpdate_date(Date update_date) {
        this.update_date = update_date;
    }
}
