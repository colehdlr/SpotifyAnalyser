import { apiService } from "./api";

let accessToken;

export const authService = {    

    checkAuth: async () => {
        // Check access token not null
        // If null check browser cache for cached access token (and save locally to 'accessToken')

        // Once access token attained:
        // Use apiService to check accessToken is valid - after 1 hour of not being checked, an access token is invalidated

        // If no local or cached access token, return false

        // Else return the value that the apiService returned




        return true; // TEMPORARY AUTOMATIC ACCESS
    }
};