package com.example.automation.service;

import com.example.automation.model.User;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final List<User> users = new CopyOnWriteArrayList<>();
    private final String DEFAULT_PASSWORD_HASH = hashPassword("password123");

    public UserService() {
        resetUsers();
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    public List<User> getAllUsers() {
        return users.stream().map(this::removePassword).collect(Collectors.toList());
    }

    public User getUserById(String id) {
        return users.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .map(this::removePassword)
                .orElse(null);
    }

    private User getUserByEmailInternal(String email) {
        return users.stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElse(null);
    }

    public User getUserByEmail(String email) {
        User user = getUserByEmailInternal(email);
        if (user == null)
            return null;
        return removePassword(user);
    }

    public User createUser(User data) {
        String name = data.getName() != null ? data.getName().trim() : null;
        String email = data.getEmail() != null ? data.getEmail().trim().toLowerCase() : null;
        String role = data.getRole() != null ? data.getRole() : "user";
        String password = data.getPasswordHash() != null ? data.getPasswordHash() : "password123";

        if (name == null || name.isEmpty() || email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Name and email are required");
        }

        if (getUserByEmailInternal(email) != null) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (!Pattern.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", email)) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (!role.equals("admin") && !role.equals("user")) {
            throw new IllegalArgumentException("Role must be one of: admin, user");
        }

        User newUser = new User();
        newUser.setId(UUID.randomUUID().toString());
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setRole(role);
        newUser.setPasswordHash(hashPassword(password));
        newUser.setCreatedAt(Instant.now().toString());

        users.add(newUser);
        return removePassword(newUser);
    }

    public User updateUser(String id, User updates) {
        Optional<User> optionalUser = users.stream().filter(u -> u.getId().equals(id)).findFirst();
        if (optionalUser.isEmpty())
            return null;

        User existingUser = optionalUser.get();

        String email = updates.getEmail();
        if (email != null && !email.equals(existingUser.getEmail())) {
            if (getUserByEmailInternal(email) != null) {
                throw new IllegalArgumentException("Email already exists");
            }
            if (!Pattern.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", email)) {
                throw new IllegalArgumentException("Invalid email format");
            }
            existingUser.setEmail(email.trim().toLowerCase());
        }

        String name = updates.getName();
        if (name != null) {
            existingUser.setName(name.trim());
        }

        String role = updates.getRole();
        if (role != null) {
            if (!role.equals("admin") && !role.equals("user")) {
                throw new IllegalArgumentException("Role must be one of: admin, user");
            }
            existingUser.setRole(role);
        }

        String password = updates.getPasswordHash(); // Assuming input passed as raw password in this field
        if (password != null) {
            existingUser.setPasswordHash(hashPassword(password));
        }

        existingUser.setUpdatedAt(Instant.now().toString());
        return removePassword(existingUser);
    }

    public boolean deleteUser(String id) {
        return users.removeIf(u -> u.getId().equals(id));
    }

    public User verifyPassword(String email, String password) {
        if (email == null || password == null)
            return null;
        User user = getUserByEmailInternal(email.trim().toLowerCase());
        if (user == null)
            return null;

        String inputHash = hashPassword(password);
        if (user.getPasswordHash().equals(inputHash)) {
            return removePassword(user);
        }
        return null;
    }

    public void resetUsers() {
        users.clear();
        User u1 = new User();
        u1.setId("1");
        u1.setName("Alice Johnson");
        u1.setEmail("alice@example.com");
        u1.setRole("admin");
        u1.setPasswordHash(DEFAULT_PASSWORD_HASH);
        u1.setCreatedAt("2024-01-01T00:00:00.000Z");
        User u2 = new User();
        u2.setId("2");
        u2.setName("Bob Smith");
        u2.setEmail("bob@example.com");
        u2.setRole("user");
        u2.setPasswordHash(DEFAULT_PASSWORD_HASH);
        u2.setCreatedAt("2024-01-02T00:00:00.000Z");
        User u3 = new User();
        u3.setId("3");
        u3.setName("Carol White");
        u3.setEmail("carol@example.com");
        u3.setRole("user");
        u3.setPasswordHash(DEFAULT_PASSWORD_HASH);
        u3.setCreatedAt("2024-01-03T00:00:00.000Z");
        users.add(u1);
        users.add(u2);
        users.add(u3);
    }

    private User removePassword(User user) {
        User copy = new User();
        copy.setId(user.getId());
        copy.setName(user.getName());
        copy.setEmail(user.getEmail());
        copy.setRole(user.getRole());
        copy.setCreatedAt(user.getCreatedAt());
        copy.setUpdatedAt(user.getUpdatedAt());
        return copy;
    }
}
