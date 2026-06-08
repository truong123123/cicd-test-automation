# CI/CD Test Automation with GitHub Actions

[![CI Pipeline](https://github.com/YOUR_USERNAME/cicd-test-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/cicd-test-automation/actions/workflows/ci.yml)
[![PR Validation](https://github.com/YOUR_USERNAME/cicd-test-automation/actions/workflows/pr-check.yml/badge.svg)](https://github.com/YOUR_USERNAME/cicd-test-automation/actions/workflows/pr-check.yml)
[![Coverage](https://img.shields.io/badge/coverage-≥80%25-brightgreen)](./coverage)

> A practical case study on integrating automated testing into a CI/CD pipeline using **GitHub Actions**. This project demonstrates industry best practices for test automation, continuous integration, and continuous deployment.

---

## 📖 Overview

This project showcases how to:
- Write comprehensive tests (unit, integration, E2E)
- Automate testing on every push and PR
- Enforce coverage thresholds (80%)
- Build and push Docker images automatically
- Deploy to staging/production via GitHub Actions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│               GitHub Actions                │
│                                             │
│  Push/PR ──► Lint ──► Unit Tests ──► Integration Tests
│                                    └──► E2E Tests ──► Coverage ──► Docker Build
│                                                                         │
│  Merge to main ──► Full Tests ──► Build & Push ──► Deploy Staging       │
│                                                    └──► Deploy Production (manual)
└─────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
cicd-test-automation/
├── src/
│   ├── app.js                    # Express app (testable factory)
│   ├── server.js                 # Server entry point
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── users.js              # User routes
│   │   └── products.js           # Product routes
│   ├── controllers/
│   │   ├── authController.js     # Login handler
│   │   ├── userController.js     # HTTP layer
│   │   └── productController.js
│   ├── services/
│   │   ├── userService.js        # Business logic
│   │   └── productService.js
│   └── middleware/
│       └── errorHandler.js       # Global error handling
│
├── tests/
│   ├── unit/                     # Unit tests (services)
│   │   ├── userService.test.js
│   │   └── productService.test.js
│   ├── integration/              # Integration tests (API endpoints)
│   │   ├── auth.test.js          # Authentication endpoint tests
│   │   ├── users.test.js
│   │   └── products.test.js
│   └── e2e/                      # E2E workflow tests
│       └── api.test.js
│
├── .github/
│   └── workflows/
│       ├── ci.yml                # Main CI (lint → test → build)
│       ├── pr-check.yml          # PR validation + comment
│       └── deploy.yml            # Deploy on merge to main
│
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cicd-test-automation.git
cd cicd-test-automation

# Install dependencies
npm install

# Start the server
npm start
```

The API will be available at `http://localhost:3000`

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run unit tests only (with coverage)
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run all tests with full coverage report
npm run test:coverage

# Run in CI mode (strict coverage thresholds)
npm run test:ci
```

### Coverage Requirements
The project enforces **80% minimum** coverage on:
- Lines
- Statements  
- Functions
- Branches

---

## 🔍 Code Quality

```bash
# Run ESLint
npm run lint

# Auto-fix lint errors
npm run lint:fix
```

---

## 🐳 Docker

```bash
# Build production image
docker build -t cicd-api .

# Run with Docker Compose
docker-compose up app

# Run in development mode (with hot reload)
docker-compose --profile dev up app-dev
```

---

## 📡 API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

### Authentication
| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| POST | `/api/auth/login` | Log in user | `{ "email": "...", "password": "..." }` |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (supports `?category=` filter) |
| GET | `/api/products/stats` | Get product statistics |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

---

## ⚙️ GitHub Actions Workflows

### 1. CI Pipeline (`ci.yml`)
**Triggers**: Push to any branch, PR to main/develop

```
Lint → Unit Tests (Node 18/20/21 matrix) → Integration Tests
                                         → E2E Tests
                                         → Coverage Report → Docker Build (main only)
```

### 2. PR Validation (`pr-check.yml`)
**Triggers**: Pull Requests to main/develop

- Runs lint + full test suite
- Comments test results and coverage table on the PR
- Blocks merge if any check fails

### 3. Deploy Pipeline (`deploy.yml`)
**Triggers**: Push to main, Manual dispatch

```
Full Tests → Build & Push Docker Image → Deploy Staging → Deploy Production (manual)
```

---

## 📊 Test Structure

### Unit Tests
Test each service function in isolation:
- Happy path (normal inputs)
- Edge cases (boundary values)
- Error cases (invalid inputs)

### Integration Tests
Test API endpoints with supertest:
- HTTP status codes
- Response body structure
- Data persistence across requests

### E2E Tests
Test complete user workflows:
- Full CRUD lifecycle (create → read → update → delete)
- Cross-resource interactions
- Error recovery scenarios
- Concurrent operations

---

## 🔐 Security Features

- **Helmet.js**: Sets secure HTTP headers
- **Non-root Docker user**: Container runs as `nodeuser`
- **CORS**: Configured for API access control
- **Input validation**: All inputs validated before processing
- **Error handling**: No stack traces in production

---

## 📝 License

MIT © CI/CD Case Study
