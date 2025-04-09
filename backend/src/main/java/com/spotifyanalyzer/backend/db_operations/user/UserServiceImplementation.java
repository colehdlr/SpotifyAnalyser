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
    public User registerUser(User user) throws Exception {
        if(user == null) {
            throw new Exception("User is null");
        }
        List<User> existingUsers = userRepository.findAllBySpotifyUsername(user.getSpotifyUsername());

        if (!existingUsers.isEmpty()) {
            User existingUser = existingUsers.get(0);
            if (existingUsers.size() > 1) {
                System.out.println("Found " + existingUsers.size() + " duplicate users with username: " +
                        user.getSpotifyUsername() + ". Using first one and removing others.");

                for (int i = 1; i < existingUsers.size(); i++) {
                    userRepository.delete(existingUsers.get(i));
                }
            }

            existingUser.setMinigameBestTimeInSeconds(user.getMinigameBestTimeInSeconds());
            return userRepository.save(existingUser);
        } else {
            return userRepository.save(user);
        }
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
    public User getUserMinigameTime(String username) throws Exception {
        List<User> users = userRepository.findAllBySpotifyUsername(username);
        if (users.isEmpty()) {
            throw new Exception("User not found");
        }

        if (users.size() > 1) {
            System.out.println("Warning: Found " + users.size() + " users with username: " + username + ". Using the first one.");
        }
        return users.get(0);
    }

    @Override
    public boolean deleteMinigameScore(String username) throws Exception {
        List<User> users = userRepository.findAllBySpotifyUsername(username);
        if (users.isEmpty()) {
            return false;
        }
        for (User user : users) {
            userRepository.delete(user);
        }
        return true;
    }
}
