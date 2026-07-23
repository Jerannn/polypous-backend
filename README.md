# Polypous

This is the backend API server for Polypous, built with Node.js, Express, TypeScript, PostgreSQL, and Redis.

---

## 🛠️ Tech Stack

- **Core**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (via `pg`)
- **Caching & Rate Limiting**: Redis / Upstash Redis
- **Automation / Printing**: Puppeteer (used for PDF generation)
- **Security**: bcryptjs, jsonwebtoken (JWT authentication), helmet, express-rate-limit

---

## 📦 Getting Started

### Prerequisites

Ensure you have:

- **Node.js** (v18+)
- **PostgreSQL** running
- **Redis** running (or Upstash credentials)

### Installation

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### Configuration

Create a `.config.env` (or `.env`) file in the root of the backend directory matching your local setup (database credentials, Redis details, and secrets).

### Development

Start the development server with automatic reload:

```bash
npm run start:dev
```

### Production Build

Build and run the production server:

```bash
npm run build
npm run start:prod
```

### Testing

Run the test suite:

```bash
npm run test
```
