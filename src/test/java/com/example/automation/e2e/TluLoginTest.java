package com.example.automation.e2e;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class TluLoginTest {

    private static WebDriver driver;
    private static WebDriverWait wait;

    @BeforeAll
    public static void setup() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();

        String isCI = System.getenv("CI");
        if ("true".equalsIgnoreCase(isCI)) {
            options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
        } else {
            // Optional local options
            // options.addArguments("--headless=new");
        }

        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterAll
    public static void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testLoginAccount1() {
        System.out.println("Running login test 1...");
        performLogin("2351067118", "077205009741");
    }

    @Test
    public void testLoginAccount2() {
        System.out.println("Running login test 2...");
        performLogin("2351067118", "077205009740");
    }

    private void performLogin(String username, String password) {
        driver.get("https://sinhvien1.tlu.edu.vn/#/login");

        // Wait for Angular initialization (similar to Thread.sleep(2000) in JS)
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Wait for input elements
        wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("input")));
        List<WebElement> inputs = driver.findElements(By.tagName("input"));

        WebElement usernameInput = null;
        WebElement passwordInput = null;

        for (WebElement input : inputs) {
            String type = input.getAttribute("type");
            String placeholder = input.getAttribute("placeholder");
            if (placeholder == null)
                placeholder = "";
            String name = input.getAttribute("name");
            if (name == null)
                name = "";

            if ("password".equals(type)) {
                passwordInput = input;
            } else if ("text".equals(type) || placeholder.toLowerCase().contains("mã") ||
                    placeholder.toLowerCase().contains("tên") || name.toLowerCase().contains("user")) {
                if (usernameInput == null) {
                    usernameInput = input;
                }
            }
        }

        // Fallback
        if (usernameInput == null && inputs.size() > 0)
            usernameInput = inputs.get(0);
        if (passwordInput == null && inputs.size() > 1)
            passwordInput = inputs.get(1);

        if (usernameInput == null || passwordInput == null) {
            throw new RuntimeException("Could not detect username/password inputs");
        }

        usernameInput.clear();
        usernameInput.sendKeys(username);

        passwordInput.clear();
        passwordInput.sendKeys(password);

        passwordInput.sendKeys(Keys.ENTER);

        // Wait for response
        try {
            Thread.sleep(4000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String currentUrl = driver.getCurrentUrl();
        System.out.println("Current URL: " + currentUrl);

        if (currentUrl.contains("/login")) {
            String bodyText = driver.findElement(By.tagName("body")).getText().toLowerCase();
            boolean errorVisible = bodyText.contains("không chính xác") ||
                    bodyText.contains("tài khoản không tồn tại") ||
                    bodyText.contains("lỗi");
            
            if (errorVisible) {
                throw new RuntimeException("Login failed: Error message is visible on screen.");
            } else {
                throw new RuntimeException("Login failed: URL did not change after submitting.");
            }
        } else {
            System.out.println("Login successful!");
        }
    }
}
