package com.spotifyanalyzer.backend.db_operations.artist;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArtistServiceImplementation implements ArtistService
{
    @Autowired
    private ArtistRepository artistRepository;

    @Override
    public Artist addArtist(Artist user) throws Exception
    {
        if(user!=null)
        {
            return artistRepository.save(user);
        }
        throw new Exception("User is null");
    }

    @Override
    public List<Artist> getRegisteredArtists() throws Exception
    {
        List<Artist> artists = artistRepository.findAll();
        if(artists!=null)
        {
            return artists;
        }
        throw new Exception("No artists found");
    }

    @Override
    public Artist updateArtistSummary(String artistName, String summary) throws Exception
    {
        Artist artist = artistRepository.findByArtistName(artistName);
        if (artist != null)
        {
            artist.setSummary(summary);
            return artistRepository.save(artist);
        }
        throw new Exception("Artist not found");
    }

    @Override
    public Artist getArtistByName(String artistName) throws Exception
    {
        Artist artist = artistRepository.findByArtistName(artistName);
        if (artist != null)
        {
            return artist;
        }
        throw new Exception("Artist not found");
    }
}
