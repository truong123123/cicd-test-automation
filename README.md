# CI/CD Test Automation with GitHub Actions (Java Spring Boot)

A practical case study on integrating automated testing into a CI/CD pipeline using GitHub Actions. This project has been migrated to **Java Spring Boot** and demonstrates test automation using Selenium WebDriver and JUnit 5.

## 📖 Overview
This project showcases how to:
- Build a REST API backend using Java Spring Boot.
- Write E2E (End-to-End) tests using Selenium WebDriver to automate browser actions.
- Automate testing on every push and PR using GitHub Actions.
- Handle real-world CI/CD scenarios (e.g. testing third-party logins, handling timeouts, and assertions).

## 🏗️ Architecture
```text
┌────────────────────────────────────────────────────────┐
│                    GitHub Actions                      │
│                                                        │
│  Push/PR ──► 🟢 TLU Login Test (Success Scenario)      │
│          ──► 🔴 TLU Login Test (Failure Scenario)      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## 📁 Project Structure
```text
cicd-test-automation/
├── src/
│   ├── main/java/com/example/automation/
│   │   ├── AutomationApplication.java    # Spring Boot entry point
│   │   ├── controllers/                  # REST API Controllers (Auth, User, Product)
│   │   ├── models/                       # Data Models
│   │   └── services/                     # Business Logic
│   │
│   └── test/java/com/example/automation/
│       └── e2e/
│           └── TluLoginTest.java         # Selenium WebDriver E2E tests
│
├── .github/
│   └── workflows/
│       ├── tlu-login-success.yml         # GitHub Action for Success Test
│       └── tlu-login-fail.yml            # GitHub Action for Failure Test
│
└── pom.xml                               # Maven Configuration & Dependencies
```

## 🚀 Quick Start

### Prerequisites
- Java JDK 17+
- Maven 3.8+
- Google Chrome (for Selenium tests)

### Installation & Running Locally
```bash
# Clone the repository
git clone https://github.com/truong123123/cicd-test-automation.git
cd cicd-test-automation

# Start the Spring Boot server
./mvnw spring-boot:run
```
The API will be available at `http://localhost:8080`

## 🧪 Running Tests
This project uses Maven and Selenium for End-to-End browser testing.

```bash
# Run all tests
./mvnw test

# Run a specific test (e.g., testLoginAccount1)
./mvnw test -Dtest=TluLoginTest#testLoginAccount1
```

## ⚙️ GitHub Actions Workflows

We have configured two parallel workflows that run automatically on GitHub Actions:

### 1. 🟢 TLU Login (Success Workflow)
- **File:** `tlu-login-success.yml`
- **Trigger:** Push to any branch, PR to main/develop.
- **Description:** Runs `testLoginAccount2`. Automates Chrome to enter a valid set of credentials and asserts that the login completes successfully (the URL leaves the `/#/login` page).

### 2. 🔴 TLU Login (Failure Workflow)
- **File:** `tlu-login-fail.yml`
- **Trigger:** Push to any branch, PR to main/develop.
- **Description:** Runs `testLoginAccount1`. Attempts to login with specific credentials. The test succeeds if the application correctly prevents the login and stays on the login page or shows an error.

## 📡 API Endpoints (Mocked Backend)
The Spring Boot application includes several built-in controllers for testing purposes:
- **Authentication**: `POST /api/auth/login`
- **Users**: `GET /api/users`, `POST /api/users`, etc.
- **Products**: `GET /api/products`, `POST /api/products`, etc.

## 🔐 Tools & Libraries
- **Spring Boot 3.x:** Backend framework.
- **Selenium WebDriver & WebDriverManager:** Browser automation.
- **JUnit 5:** Test runner and assertions.
- **GitHub Actions:** CI/CD runners (ubuntu-latest).
