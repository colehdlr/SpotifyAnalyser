package com.spotifyanalyzer.backend.db_operations.artist;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class ArtistServiceImplementation implements ArtistService
{
    @Autowired
    private ArtistRepository artistRepository;

    @Value("${backend.url}")
    private String backendUrl;

    @Override
    public String fetchArtistSummary(String artistName) throws JsonProcessingException {
        Artist artist = artistRepository.findByArtistName(artistName);

        // if the artist is not found in the database, add in the database
        if (artist == null)
        {
            artist = new Artist();
            artist.setArtistName(artistName);
            updateSummaryAndDate(artistName, artist, new Date());
        }
        else {
            // if more than 30 days have passed since the last update, update the summary
            Date currentDate = new Date();
            long diffInMilliseconds = currentDate.getTime() - artist.getUpdate_date().getTime();
            long diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
            if (diffInDays > 30)
            {
                updateSummaryAndDate(artistName, artist, currentDate);
            }
        }
        return artist.getSummary();
    }

    private void updateSummaryAndDate(String artistName, Artist artist, Date currentDate) throws JsonProcessingException {
    String newSummary = getSummaryFromMicroservice(artistName);
        artist.setSummary(newSummary);
        artist.setUpdate_date(currentDate);
        artistRepository.save(artist);
    }

    // Package-private for testing
    String getSummaryFromMicroservice(String artistName) throws JsonProcessingException {
        // Use microservice Docker service name instead of localhost
        String url = "http://microservice:5000/artistSummary";

        RestTemplate restTemplate = createRestTemplate();
        System.out.println("Requesting summary from: " + url);

        // Create request body with artist name
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("artistName", artistName);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestBody, String.class);

            if (response.getStatusCode().is2xxSuccessful())
            {
                // Parse the JSON response to extract the summary
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                return rootNode.get("artist_summary").asText();
            }
            else
            {
                System.out.println("Microservice returned status: " + response.getStatusCode());
                return "No summary found";
            }
        } catch (Exception e) {
            System.out.println("Error calling microservice: " + e.getMessage());
            e.printStackTrace();
            return "Error getting summary";
        }
    }

    // Added for testability
    RestTemplate createRestTemplate() {
        return new RestTemplate();
    }
}