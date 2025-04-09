package com.spotifyanalyzer.backend.db_operations.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<User> updateMinigameTime(@RequestParam String username, @RequestParam long newTime) throws Exception
    {
        User user = userService.getUserMinigameTime(username);
        if (user != null)
        {
            if (newTime < user.getMinigameBestTimeInSeconds())
            {
                user.setMinigameBestTimeInSeconds(newTime);
                userService.registerUser(user);
                return new ResponseEntity<>(user, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}


