package com.spotifyanalyzer.backend.db_operations.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/db/users")
public class UserDatabaseController
{
    @Autowired
    private UserService userService;


    //Registers the users
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) throws Exception
    {
        if(user!=null)
        {
            userService.registerUser(user);
            return new ResponseEntity<>(user, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    //Get all the registered users.
    @GetMapping("/getAllusers")
    public ResponseEntity<List<User>>getRegisteredUser() throws Exception
    {
        List<User>users=userService.getRegisteredUsers();
        if(users!=null)
        {
            return new ResponseEntity<>(users,HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @GetMapping("/topMinigamePlayers")
    public ResponseEntity<List<User>> getTopMinigamePlayers() throws Exception
    {
        List<User> users = userService.getTopMinigamePlayers();
        if (users != null)
        {
            return new ResponseEntity<>(users, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    //get a user minigame time
    @GetMapping("/userMinigameTime")
    public ResponseEntity<User> getUserMinigameTime(@RequestParam String username) throws Exception
    {
        User user = userService.getUserMinigameTime(username);
        if (user != null)
        {
            return new ResponseEntity<>(user, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    //update the user minigame time if it is less than the previous time
    @PutMapping("/updateMinigameTime")
    public ResponseEntity<?> updateMinigameTime(@RequestParam String username, @RequestParam long newTime) {
        try {
            User user;
            boolean isNewUser = false;

            try {
                user = userService.getUserMinigameTime(username);
            } catch (Exception e) {
                user = new User(username, newTime);
                isNewUser = true;
            }

            if (isNewUser || newTime < user.getMinigameBestTimeInSeconds()) {
                user.setMinigameBestTimeInSeconds(newTime);
                userService.registerUser(user);

                Map<String, Object> response = new HashMap<>();
                response.put("user", user);
                response.put("isNewUser", isNewUser);

                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "New time is not better than previous best time");
                response.put("currentBestTime", user.getMinigameBestTimeInSeconds());
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(
                    Map.of("error", "Failed to update minigame time: " + e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @DeleteMapping("/deleteMinigameScore")
    public ResponseEntity<?> deleteMinigameScore(@RequestParam String username) {
        try {
            boolean deleted = userService.deleteMinigameScore(username);

            if (deleted) {
                return new ResponseEntity<>(
                        Map.of("message", "Minigame score deleted successfully"),
                        HttpStatus.OK
                );
            } else {
                return new ResponseEntity<>(
                        Map.of("message", "No score found to delete"),
                        HttpStatus.OK
                );
            }
        } catch (Exception e) {
            return new ResponseEntity<>(
                    Map.of("error", "Error: " + e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}


