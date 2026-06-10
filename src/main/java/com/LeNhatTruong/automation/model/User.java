package com.LeNhatTruong.automation.model;

import lombok.Data;

@Data
public class User {
    private String id;
    private String name;
    private String email;
    private String role;
    private String passwordHash;
    private String createdAt;
    private String updatedAt;
}
