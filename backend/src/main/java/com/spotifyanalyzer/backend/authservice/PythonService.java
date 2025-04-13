package com.spotifyanalyzer.backend.authservice;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class PythonService {
    private static final String USER_AGENT = "Mozilla/5.0";

    public String sendPOST(String jsonInputString, String url) throws IOException {
        System.out.println("Sending POST request to Python service with URL: " + url);
        URL obj = new URL(url);


        HttpURLConnection con = (HttpURLConnection) obj.openConnection();
        con.setRequestMethod("POST");
        con.setRequestProperty("User-Agent", USER_AGENT);
        con.setRequestProperty("Content-Type", "application/json; utf-8");
        con.setRequestProperty("Accept", "application/json");
        con.setDoOutput(true);

        try (DataOutputStream wr = new DataOutputStream(con.getOutputStream())) {
            wr.writeBytes(jsonInputString);
            wr.flush();
        }

        int responseCode = con.getResponseCode();
        System.out.println("POST Response Code :: " + responseCode);

        if (responseCode == HttpURLConnection.HTTP_OK) { // success
            try (BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()))) {
                String inputLine;
                StringBuilder response = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }

                // print result
                System.out.println(response.toString());

                return response.toString();
            }
        } else {
            System.out.println("POST request did not work.");
            return null;
        }
    }
}