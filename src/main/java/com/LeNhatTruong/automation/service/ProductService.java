package com.LeNhatTruong.automation.service;

import com.LeNhatTruong.automation.model.Product;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final List<Product> products = new CopyOnWriteArrayList<>();

    public ProductService() {
        resetProducts();
    }

    public List<Product> getAllProducts(String category) {
        if (category == null || category.isEmpty()) {
            return new ArrayList<>(products);
        }
        return products.stream()
                .filter(p -> p.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }

    public Product getProductById(String id) {
        return products.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public Product createProduct(Product data) {
        if (data.getName() == null || data.getPrice() == null || data.getCategory() == null) {
            throw new IllegalArgumentException("Name, price, and category are required");
        }
        if (data.getPrice() < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        if (data.getStock() != null && data.getStock() < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }

        Product newProduct = new Product();
        newProduct.setId(UUID.randomUUID().toString());
        newProduct.setName(data.getName());
        newProduct.setDescription(data.getDescription() != null ? data.getDescription() : "");
        newProduct.setPrice(data.getPrice());
        newProduct.setCategory(data.getCategory());
        newProduct.setStock(data.getStock() != null ? data.getStock() : 0);
        newProduct.setCreatedAt(Instant.now().toString());

        products.add(newProduct);
        return newProduct;
    }

    public Product updateProduct(String id, Product updates) {
        Optional<Product> optionalProduct = products.stream().filter(p -> p.getId().equals(id)).findFirst();
        if (optionalProduct.isEmpty()) return null;

        Product existingProduct = optionalProduct.get();

        if (updates.getName() != null) existingProduct.setName(updates.getName());
        if (updates.getDescription() != null) existingProduct.setDescription(updates.getDescription());
        
        if (updates.getPrice() != null) {
            if (updates.getPrice() < 0) throw new IllegalArgumentException("Price cannot be negative");
            existingProduct.setPrice(updates.getPrice());
        }
        
        if (updates.getCategory() != null) existingProduct.setCategory(updates.getCategory());
        
        if (updates.getStock() != null) {
            if (updates.getStock() < 0) throw new IllegalArgumentException("Stock cannot be negative");
            existingProduct.setStock(updates.getStock());
        }

        existingProduct.setUpdatedAt(Instant.now().toString());
        return existingProduct;
    }

    public boolean deleteProduct(String id) {
        return products.removeIf(p -> p.getId().equals(id));
    }

    public Map<String, Object> getProductStats() {
        int totalProducts = products.size();
        double totalValue = products.stream().mapToDouble(p -> p.getPrice() * p.getStock()).sum();
        int lowStockCount = (int) products.stream().filter(p -> p.getStock() < 10).count();
        int outOfStockCount = (int) products.stream().filter(p -> p.getStock() == 0).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("totalValue", totalValue);
        stats.put("lowStockCount", lowStockCount);
        stats.put("outOfStockCount", outOfStockCount);
        return stats;
    }

    public void resetProducts() {
        products.clear();
        Product p1 = new Product(); p1.setId("1"); p1.setName("Laptop Pro"); p1.setDescription("High performance laptop"); p1.setPrice(1299.99); p1.setCategory("electronics"); p1.setStock(50); p1.setCreatedAt("2024-01-01T00:00:00.000Z");
        Product p2 = new Product(); p2.setId("2"); p2.setName("Wireless Mouse"); p2.setDescription("Ergonomic wireless mouse"); p2.setPrice(29.99); p2.setCategory("electronics"); p2.setStock(150); p2.setCreatedAt("2024-01-02T00:00:00.000Z");
        Product p3 = new Product(); p3.setId("3"); p3.setName("Coffee Maker"); p3.setDescription("Programmable coffee maker"); p3.setPrice(79.99); p3.setCategory("home"); p3.setStock(30); p3.setCreatedAt("2024-01-03T00:00:00.000Z");
        Product p4 = new Product(); p4.setId("4"); p4.setName("Running Shoes"); p4.setDescription("Lightweight running shoes"); p4.setPrice(89.99); p4.setCategory("sports"); p4.setStock(0); p4.setCreatedAt("2024-01-04T00:00:00.000Z");
        Product p5 = new Product(); p5.setId("5"); p5.setName("Smart Watch"); p5.setDescription("Fitness tracking smartwatch"); p5.setPrice(199.99); p5.setCategory("electronics"); p5.setStock(5); p5.setCreatedAt("2024-01-05T00:00:00.000Z");
        products.addAll(Arrays.asList(p1, p2, p3, p4, p5));
    }
}
