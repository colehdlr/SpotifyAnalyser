import { apiService } from "./api";

export const fetchTopArtists = async () => {
    const data = await apiService.getTopArtists("short_term", 10);
    const artists = data.items;

    const artistNameList = artists.map(artist => artist.name);

    return artistNameList;
}

export const searchArtists = async (searchTerm, limit) => {
    const data = await apiService.searchArtists(searchTerm, limit);

    const artists = data?.artists?.items || [];

    const artistNameList = artists.map(artist => artist.name);
    
    return artistNameList;
}


export const fetchTopTracks = async () => {
    const data = await apiService.getTopTracks("short_term", 10);
    const tracks = data.items;

    const trackNameList = tracks.map(track => `${track.name} by ${track.artists[0].name}`);

    return trackNameList;
}

export const searchTracks = async (searchTerm, limit) => {
    const data = await apiService.searchTracks(searchTerm, limit);

    const tracks = data?.tracks?.items || [];

    const trackNameList = tracks.map(track => `${track.name} by ${track.artists[0].name}`);
    
    return trackNameList;
}