package com.LeNhatTruong.automation.controller;

import com.LeNhatTruong.automation.model.User;
import com.LeNhatTruong.automation.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Email and password are required");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        User user = userService.verifyPassword(email, password);

        if (user == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Invalid email or password");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        String mockToken = "mock_jwt_token_for_" + user.getId() + "_" + Base64.getEncoder().encodeToString(user.getEmail().getBytes());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Login successful");
        response.put("token", mockToken);
        response.put("user", user);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
