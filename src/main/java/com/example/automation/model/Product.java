package com.example.automation.model;

import lombok.Data;

@Data
public class Product {
    private String id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private Integer stock;
    private String createdAt;
    private String updatedAt;
}
