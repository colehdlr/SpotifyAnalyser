package com.spotifyanalyzer.backend.db_operations.artist;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ArtistServiceImplementationTest {

    @Mock
    private ArtistRepository artistRepository;

    @InjectMocks
    private ArtistServiceImplementation artistService;

    private final String ARTIST_NAME = "Test Artist";
    private final String SUMMARY = "Test artist summary";
    private final String BACKEND_URL = "http://localhost:8080";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(artistService, "backendUrl", BACKEND_URL);
    }

    @Test
    void testFetchArtistSummary_ArtistNotInDatabase() throws JsonProcessingException {
        ArtistServiceImplementation spy = spy(artistService);

        when(artistRepository.findByArtistName(ARTIST_NAME)).thenReturn(null);

        // Mock the summary retrieval
        doReturn(SUMMARY).when(spy).getSummaryFromMicroservice(ARTIST_NAME);

        String result = spy.fetchArtistSummary(ARTIST_NAME);

        assertEquals(SUMMARY, result);

        ArgumentCaptor<Artist> artistCaptor = ArgumentCaptor.forClass(Artist.class);
        verify(artistRepository).save(artistCaptor.capture());

        Artist savedArtist = artistCaptor.getValue();
        assertEquals(ARTIST_NAME, savedArtist.getArtistName());
        assertEquals(SUMMARY, savedArtist.getSummary());
        assertNotNull(savedArtist.getUpdate_date());
    }

    @Test
    void testFetchArtistSummary_ArtistInDatabaseButOutdated() throws JsonProcessingException {
        ArtistServiceImplementation spy = spy(artistService);

        // Setup artist in database with old date
        Artist existingArtist = new Artist();
        existingArtist.setArtistName(ARTIST_NAME);
        existingArtist.setSummary("Old summary");

        // Set update date to more than 30 days ago
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -33);
        Date oldDate = calendar.getTime();
        existingArtist.setUpdate_date(oldDate);

        when(artistRepository.findByArtistName(ARTIST_NAME)).thenReturn(existingArtist);

        doReturn(SUMMARY).when(spy).getSummaryFromMicroservice(ARTIST_NAME);

        String result = spy.fetchArtistSummary(ARTIST_NAME);

        assertEquals(SUMMARY, result);

        // Verify the existing Artist was updated and saved
        verify(artistRepository).save(existingArtist);
        assertEquals(SUMMARY, existingArtist.getSummary());
        assertTrue(existingArtist.getUpdate_date().after(oldDate));
    }

    @Test
    void testFetchArtistSummary_ArtistInDatabaseAndUpToDate() throws JsonProcessingException {
        ArtistServiceImplementation spy = spy(artistService);

        Artist existingArtist = new Artist();
        existingArtist.setArtistName(ARTIST_NAME);
        existingArtist.setSummary(SUMMARY);

        // Set update date to less than 30 days ago
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -15);
        Date recentDate = calendar.getTime();
        existingArtist.setUpdate_date(recentDate);

        when(artistRepository.findByArtistName(ARTIST_NAME)).thenReturn(existingArtist);

        String result = spy.fetchArtistSummary(ARTIST_NAME);

        assertEquals(SUMMARY, result);

        // Verify that the microservice was not called
        verify(spy, never()).getSummaryFromMicroservice(anyString());

        // Verify the repository save was not called
        verify(artistRepository, never()).save(any(Artist.class));
    }

    @Test
    void testGetSummaryFromMicroservice() throws Exception {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);

        TestableArtistService testService = new TestableArtistService(mockRestTemplate);
        ReflectionTestUtils.setField(testService, "backendUrl", BACKEND_URL);
        ReflectionTestUtils.setField(testService, "artistRepository", artistRepository);

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode rootNode = mapper.createObjectNode();
        rootNode.put("artist_summary", SUMMARY);
        String jsonResponse = mapper.writeValueAsString(rootNode);

        ResponseEntity<String> responseEntity = new ResponseEntity<>(jsonResponse, HttpStatus.OK);

        when(mockRestTemplate.postForEntity(
                anyString(),  // environment agnostic
                any(),
                eq(String.class)
        )).thenReturn(responseEntity);

        String result = testService.getSummaryFromMicroservice(ARTIST_NAME);

        // Verify
        assertEquals(SUMMARY, result);
    }

    @Test
    void testGetSummaryFromMicroservice_NonSuccessResponse() throws Exception {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);

        TestableArtistService testService = new TestableArtistService(mockRestTemplate);
        ReflectionTestUtils.setField(testService, "backendUrl", BACKEND_URL);
        ReflectionTestUtils.setField(testService, "artistRepository", artistRepository);

        // Mock non-success REST response
        ResponseEntity<String> responseEntity = new ResponseEntity<>(HttpStatus.NOT_FOUND);

        when(mockRestTemplate.postForEntity(
                anyString(),
                any(),
                eq(String.class)
        )).thenReturn(responseEntity);

        // Test the method directly
        String result = testService.getSummaryFromMicroservice(ARTIST_NAME);

        // Verify
        assertEquals("No summary found", result);
    }

    @Test
    void testGetSummaryFromMicroservice_Exception() throws Exception {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);

        TestableArtistService testService = new TestableArtistService(mockRestTemplate);
        ReflectionTestUtils.setField(testService, "backendUrl", BACKEND_URL);
        ReflectionTestUtils.setField(testService, "artistRepository", artistRepository);

        // Mock an exception being thrown
        when(mockRestTemplate.postForEntity(
                anyString(),
                any(),
                eq(String.class)
        )).thenThrow(new RuntimeException("Connection error"));

        // Test the method directly
        String result = testService.getSummaryFromMicroservice(ARTIST_NAME);

        // Verify
        assertEquals("Error getting summary", result);
    }

    private class TestableArtistService extends ArtistServiceImplementation {
        private final RestTemplate restTemplate;

        public TestableArtistService(RestTemplate restTemplate) {
            this.restTemplate = restTemplate;
        }

        @Override
        protected RestTemplate createRestTemplate() {
            return restTemplate;
        }
    }
}