package com.spotifyanalyzer.backend.db_operations.artist;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/db/artists")
public class ArtistDatabaseController
{
    @Autowired
    private ArtistService artistService;


    //Adds the artist
    @PostMapping("/add")
    public ResponseEntity<Artist> register(@RequestBody Artist artist) throws Exception
    {
        if(artist!=null)
        {
            artistService.addArtist(artist);
            return new ResponseEntity<>(artist, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    //Get all the registered artists.
    @GetMapping("/getAllArtists")
    public ResponseEntity<List<Artist>> getRegisteredArtist() throws Exception
    {
        List<Artist> artists=artistService.getRegisteredArtists();
        if (artists!=null)
        {
            return new ResponseEntity<>(artists,HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    //update artist summary
    @PutMapping("/updateArtistSummary")
    public ResponseEntity<Artist> updateArtistSummary(@RequestParam String artistName, @RequestParam String summary) throws Exception
    {
        Artist artist = artistService.updateArtistSummary(artistName, summary);
        if (artist != null)
        {
            return new ResponseEntity<>(artist, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    //get artist by name
    @GetMapping("/getArtistByName")
    public ResponseEntity<Artist> getArtistByName(@RequestParam String artistName) throws Exception
    {
        Artist artist = artistService.getArtistByName(artistName);
        if (artist != null)
        {
            return new ResponseEntity<>(artist, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

}


