package com.spotifyanalyzer.backend.db_operations.user;

import java.util.List;

public interface UserService
{
    public User registerUser(User user) throws Exception;
    public List<User> getRegisteredUsers() throws Exception;
    public List<User> getTopMinigamePlayers() throws Exception;
    public User getUserMinigameTime(String username) throws Exception;
}

