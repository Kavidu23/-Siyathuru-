# Siyathuru

<p align="center">
  <strong>AI-assisted community networking platform for Sri Lankan communities</strong><br />
  Built with Angular, Express, MongoDB, Firebase, Chart.js, and Docker.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Angular%2018-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 18" />
  <img src="https://img.shields.io/badge/Backend-Express%205-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Realtime-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Charts-Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />
  <img src="https://img.shields.io/badge/Containers-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

## Overview

Siyathuru is a full-stack community platform focused on helping people discover, join, manage, and grow communities. The current codebase includes role-based access, private/public community workflows, events, alerts, admin analytics, image moderation, collaboration suggestions, AI-powered recommendations, and Firebase-backed chat.

## Current Status

This repository is actively structured as a working multi-service application with:

- Angular 18 frontend in `frontend/`
- Express 5 backend in `backend/`
- MongoDB persistence
- Docker Compose setup in `docker-compose.yml`
- GitHub Actions CI in `.github/workflows/ci.yml`
- Admin analytics dashboard with charts and PDF reporting

Implemented modules visible in the current backend routes:

- Users and authentication
- Communities and private community requests
- Events
- Alerts
- Feedback
- Uploads and community photo management
- Community verification
- AI recommendations
- Collaboration suggestions

## Feature Snapshot

| Area | Current capabilities |
| --- | --- |
| Authentication | Registration, login/logout, email verification, forgot password, reset password, JWT cookie session |
| Roles | `member`, `leader`, `admin` access control |
| Communities | Community CRUD, public/private community behavior, join flows, verification workflows |
| Events | Event CRUD, join event, user event feed, attendee email notifications on cancellation |
| Alerts | Community alerts with role restrictions and alert count analytics |
| Feedback | Feedback submission, listing, and count analytics |
| Discovery | Map-based community discovery using Leaflet and OpenStreetMap |
| AI | Hugging Face-powered recommendation endpoint |
| Moderation | NSFW image filtering before upload persistence |
| Media | Cloudinary-based upload handling and community photo management |
| Chat | Firebase Firestore-backed chat threads in the frontend |
| Analytics | Dashboard charts and PDF report export for admin views |

## Tech Stack

### Frontend

- Angular 18
- RxJS
- Chart.js
- Leaflet
- AngularFire / Firebase
- jsPDF

### Backend

- Node.js
- Express 5
- Mongoose
- JWT
- Multer
- Cloudinary
- Nodemailer

### AI, Moderation, and Data

- Hugging Face Inference API
- TensorFlow.js
- `nsfwjs`
- MongoDB
- Firebase Firestore

## Architecture

1. The Angular frontend serves the UI and calls REST endpoints from the backend.
2. The Express backend handles authentication, authorization, business logic, file upload flows, and AI integration.
3. MongoDB stores users, communities, events, alerts, feedback, and related application data.
4. Firebase Firestore supports chat messaging features in the frontend.
5. Cloudinary stores uploaded image assets.
6. Hugging Face powers AI-assisted recommendation features.

## Repository Structure

```text
.
|-- .github/
|   `-- workflows/
|       `-- ci.yml
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- test/
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- src/
|   |-- public/
|   |-- angular.json
|   |-- nginx.conf
|   `-- package.json
|-- CONTRIBUTING.md
|-- docker-compose.yml
`-- README.md
```

## API Surface

Current backend route groups:

- `/api/users`
- `/api/communities`
- `/api/private-communities`
- `/api/events`
- `/api/requests`
- `/api/alerts`
- `/api/feedbacks`
- `/api/upload`
- `/api/community-photos`
- `/api/community-verification`
- `/api/ai`
- `/api/collaborations`

Important auth-related endpoints:

- `POST /api/users/forgot-password`
- `POST /api/users/reset-password`

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB
- Cloudinary account
- SMTP credentials for outgoing emails
- Hugging Face token
- Firebase project for chat support

## Environment Setup

Create `backend/.env` with values similar to:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=replace_with_strong_secret

MONGO_URI_LOCAL=mongodb://127.0.0.1:27017/
MONGO_URI_DOCKER=mongodb://mongo:27017/
MONGO_DB_NAME=Siyathuru

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

HF_TOKEN=your_hf_token
HF_CHAT_MODEL=meta-llama/Llama-3.3-70B-Instruct

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
SMTP_REJECT_UNAUTHORIZED=false
MAIL_FROM="Siyathuru <no-reply@example.com>"
FRONTEND_URL="http://localhost:4200"
```

Notes:

- The backend selects the MongoDB URI using the `DOCKERIZED` flag.
- Docker Compose sets `DOCKERIZED=1` automatically.
- Firebase configuration is currently maintained in the frontend source.

## Local Development

### 1. Install dependencies

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

### 2. Start the backend

```bash
cd backend
npm run dev
```

### 3. Start the frontend

```bash
cd frontend
npm start
```

Local endpoints:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`

## Docker

Run the full stack with Docker Compose:

```bash
docker compose up --build
```

Container endpoints:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

## Quality Checks

### Frontend

```bash
cd frontend
npm run lint
npm run format:check
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

### Backend

```bash
cd backend
npm run lint
npm run format:check
npm test
```

## CI

The GitHub Actions pipeline currently runs:

- Backend dependency install, Prettier, ESLint, and tests
- Frontend dependency install, Prettier, ESLint, build, and headless unit tests

See `.github/workflows/ci.yml`.

## Security Notes

- JWT authentication uses HTTP-only cookies
- Role-based middleware protects restricted routes
- CORS is configured for credentialed frontend access
- NSFW filtering runs before image persistence

## Known Notes

- Backend CORS is currently tied to `http://localhost:4200` in the local development flow
- Firebase configuration is stored in the frontend project
- External services are required for full functionality: MongoDB, SMTP, Cloudinary, Hugging Face, and Firebase

## Contributing

See `CONTRIBUTING.md`.

## Maintainer

Kavidu Lakshan
