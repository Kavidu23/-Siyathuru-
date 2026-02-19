# Siyathuru - AI-Driven Social Networking for Community Platform

Siyathuru is a web based community platform focused on Sri Lankan communities. It combines community discovery, membership workflows, event management, alerts, AI-assisted recommendations, and role-based collaboration tools.

## What the project currently includes

- User registration with email verification code flow
- Login/logout with JWT stored in an HTTP-only cookie (`authToken`)
- Forgot password flow with email reset link + secure token-based password reset
- Role-based access (`member`, `leader`, `admin`)
- Community CRUD with public/private join behavior
- Private community join-request handling
- Event CRUD, event joining, and attendee notification emails on cancellation
- Community alerts with role restrictions
- Super admin analytics with PDF report download (`communities-report.pdf`)
- Community photo uploads with NSFW image filtering
- AI endpoint (Hugging Face Inference) for community recommendations
- Community collaboration suggestions based on type + geolocation proximity
- Angular discovery page with Leaflet map + OpenStreetMap tiles
- Firebase Firestore-backed chat threads in the frontend
- Community Performance Report download for the super admin

## Tech stack

- Frontend: Angular 18, RxJS, Leaflet, Chart.js, AngularFire (Firestore), jsPDF
- Backend: Node.js, Express 5, Mongoose, JWT, Multer, Cloudinary, Nodemailer
- AI/Moderation: Hugging Face Inference API, TensorFlow.js + `nsfwjs`
- Database: MongoDB
- Containerization: Docker + Docker Compose
- Formatting: Prettier (frontend + backend)

## High-level architecture

1. Angular app (`frontend/`) serves UI and calls REST APIs on `http://localhost:3000/api/*` in local mode.
2. Express app (`backend/server.js`) exposes domain routes and handles auth/authorization.
3. MongoDB stores users, communities, events, requests, alerts, feedback, and metadata.
4. Cloudinary stores uploaded images.
5. Firebase Firestore is used for chat message threads.
6. Hugging Face Inference powers the AI recommendation endpoint.

## Repository layout

```text
.
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- test/
|   `-- server.js
|-- frontend/
|   |-- src/
|   |-- public/
|   |-- angular.json
|   `-- nginx.conf
|-- docker-compose.yml
`-- README.md
```

## Prerequisites

- Node.js 20+ recommended
- npm 10+
- MongoDB (local install or container)
- Cloudinary account (for uploads)
- SMTP credentials (for verification/cancellation emails)
- Hugging Face token (for AI endpoint)
- Firebase project (Firestore chat)

## Environment configuration

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=replace_with_strong_secret

# Mongo
MONGO_URI_LOCAL=mongodb://127.0.0.1:27017/
MONGO_URI_DOCKER=mongodb://mongo:27017/
MONGO_DB_NAME=Siyathuru

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Hugging Face
HF_TOKEN=your_hf_token
HF_CHAT_MODEL=meta-llama/Llama-3.3-70B-Instruct

# SMTP
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
- Backend selects DB URI by `DOCKERIZED` flag. Docker Compose sets `DOCKERIZED=1` automatically.
- Frontend currently contains Firebase config in `frontend/src/app/environment/environment.ts`.

## Run locally (without Docker)

1. Install backend dependencies:
```bash
cd backend
npm install
```
2. Install frontend dependencies:
```bash
cd ../frontend
npm install
```
3. Start backend:
```bash
cd ../backend
npm run dev
```
4. Start frontend:
```bash
cd ../frontend
npm start
```

Endpoints:
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000`

## Run with Docker Compose

```bash
docker compose up --build
```

Services:
- Frontend (Nginx): `http://localhost:4200`
- Backend API: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

## API modules (summary)

- `/api/users` - auth, verification, user CRUD, session check
- `/api/communities` - community CRUD, membership actions
- `/api/private-communities` - private join request lifecycle
- `/api/events` - event CRUD, join event, user event feed
- `/api/requests` - authenticated request management
- `/api/alerts` - leader/member alert workflows
- `/api/feedbacks` - feedback create/list
- `/api/upload` - image upload (Cloudinary + NSFW check)
- `/api/community-photos` - leader photo gallery management
- `/api/community-verification` - leader verification request/confirm
- `/api/ai` - AI community recommendation endpoint
- `/api/collaborations` - suggested similar communities for leaders

Important user auth endpoints:
- `POST /api/users/forgot-password` - request password reset email
- `POST /api/users/reset-password` - reset password using reset token

## Testing

Backend (Jest + Supertest):

```bash
cd backend
npm test
```

Frontend (Angular/Karma):

```bash
cd frontend
npm test
```

Integration tests (backend):

```bash
cd backend
npm test -- test/integration/users.integration.test.js
```

## Code formatting

Backend:

```bash
cd backend
npm run format
npm run format:check
```

Frontend:

```bash
cd frontend
npm run format
npm run format:check
```

Prettier config is defined in:
- `backend/.prettierrc`
- `frontend/.prettierrc`

## Security model (current)

- JWT auth via HTTP-only cookie
- Route-level role middleware (`member`, `leader`, `admin`)
- CORS with credentials enabled for `http://localhost:4200`
- NSFW image moderation before upload persistence

## Known implementation notes

- CORS origin is currently hardcoded to `http://localhost:4200` in `backend/server.js`.
- No lint script is currently configured in either package (formatting is handled by Prettier).

## Maintainer

Built by Kavidu Lakshan (Rateralalage Thilakarathna).
