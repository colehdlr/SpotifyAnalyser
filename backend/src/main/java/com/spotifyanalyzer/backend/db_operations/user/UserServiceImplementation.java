package com.spotifyanalyzer.backend.db_operations.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImplementation implements UserService
{
    @Autowired
    private UserRepository userRepository;

    @Override
    public User registerUser(User user) throws Exception
    {
        if(user!=null)
        {
            return userRepository.save(user);
        }
        throw new Exception("User is null");
    }

    @Override
    public List<User> getRegisteredUsers() throws Exception
    {
        List<User>users=userRepository.findAll();
        if(users!=null)
        {
            return users;
        }
        throw new Exception("User is null");
    }

    @Override
    public List<User> getTopMinigamePlayers() throws Exception
    {
        List<User> users = userRepository.findTop5ByOrderByMinigameBestTimeInSecondsAsc();
        if (users != null)
        {
            return users;
        }
        throw new Exception("No top minigame players found");
    }

    @Override
    public User getUserMinigameTime(String username) throws Exception
    {
        User user = userRepository.findBySpotifyUsername(username);
        if (user != null)
        {
            return user;
        }
        throw new Exception("User not found");
    }

}
