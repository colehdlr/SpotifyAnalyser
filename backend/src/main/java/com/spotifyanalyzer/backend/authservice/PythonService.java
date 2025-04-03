package com.spotifyanalyzer.backend.authservice;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class PythonService {
    private static final String USER_AGENT = "Mozilla/5.0";

//    public void sendGET(String artistID) throws IOException {
//        System.out.println("Sending GET request to Python server...");
//        URL obj = new URL("http://127.0.0.1:5000/getArtistSummary/" + artistID);
//        HttpURLConnection con = (HttpURLConnection) obj.openConnection();
//        con.setRequestMethod("GET");
//        con.setRequestProperty("User-Agent", USER_AGENT);
//        int responseCode = con.getResponseCode();
//        System.out.println("GET Response Code :: " + responseCode);
//        if (responseCode == HttpURLConnection.HTTP_OK) { // success
//            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
//            String inputLine;
//            StringBuffer response = new StringBuffer();
//
//            while ((inputLine = in.readLine()) != null) {
//                response.append(inputLine);
//            }
//            in.close();
//
//            // print result
//            System.out.println(response.toString());
//        } else {
//            System.out.println("GET request did not work.");
//        }
//    }

    public String sendPOST(String jsonInputString) throws IOException {

        //TODO:pass url endpoint as a param in the future to make this more reusable
        URL obj = new URL("http://127.0.0.1:5000/artistSummary");


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