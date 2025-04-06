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

