# Siyathuru — The AI-Powered Community Network 🤖

Siyathuru is a modern AI-powered web platform for Sri Lankan community groups, designed to help people **discover communities, join events, track contributions, and connect intelligently**.

---

## 🚀 Project Overview

Siyathuru demonstrates industry-standard full-stack development through its key features:

- **Community Discovery & Events** — Create, join, and RSVP to events with real-time updates.
- **User & Community Management** — Leaders can create and manage community profiles, members, and event schedules.
- **AI-Powered Features** — Intelligent event and community recommendations and automated insights.
- **Cloud-based Deployment** — Secure, scalable, and reliable cloud infrastructure to ensure global accessibility.

---

## 🛠️ Tech Stack

The technology stack is carefully selected to provide a robust, scalable, and secure platform.

### Frontend

- Angular
- CSS for a responsive and mobile-first user interface (PWA ready).

### Backend

- Node.js (Express)
- JWT authentication and role-based access control for security.
- Python for AI/ML modules via a Flask API.

### Database

- MongoDB for a flexible, document-based database.
- Socket.IO for real-time communication and instant updates.

### Infrastructure

- AWS / Azure Cloud for a secure and production-ready deployment.
- Cloud Functions for server-side logic and API integration.

---

## 📂 Repository Structure

```
siyathuru-platform/
├── assets/
├── backend/        # Node.js + Express API + AI modules
├── frontend/       # Angular application
├── README.md
└── .gitignore
```

---

## ⚡ Getting Started (Development)

### Prerequisites

- Node.js (v18+)
- MongoDB (or a cloud-hosted service like MongoDB Atlas)
- Git

### Clone the repo

```bash
git clone https://github.com/Kavidu23/siyathuru-platform.git
cd siyathuru-platform
```

### Install & Run

- **Frontend**:

```bash
cd frontend
npm install
npm start
```

- **Backend**:

```bash
cd backend
npm install
npm start
```

---

## ✅ Features (MVP Roadmap)

- [ ] User authentication (signup/login)
- [ ] Map integration
- [ ] Community CRUD (create/list/view/edit)
- [ ] Join requests & approval system
- [ ] Events with RSVP tracking
- [ ] AI-powered event & community recommendations
- [ ] File uploads for community logos and images
- [ ] So on…

---

## 🧪 Testing

- **Backend**: Use Jest to test API endpoints.
- **Frontend**: Use Jasmine/Karma for unit testing Angular components.

Run backend tests:

```bash
cd backend
npm test
```

---

## 🤝 Workflow

As a solo project, a streamlined workflow is key to staying organized:

1. Keep a single main branch.
2. Create new branches for each feature.
3. Commit changes with clear messages.
4. Merge back into main after a feature is complete.

---

## ⚙️ DevOps Practices

To ensure maintainability, scalability, and industry alignment, Siyathuru follows these DevOps practices:

- **Version Control & Branching**

  - Single `main` branch (protected with rulesets).
  - Feature branches (e.g., `feature/auth`, `feature/events`).
  - Pull Request workflow with required status checks.

- **Continuous Integration (CI)**

  - GitHub Actions workflow runs linting and tests on every push or pull request.
  - Status checks (e.g., build and test) are enforced before merging.

- **Continuous Deployment (CD)**

  - Manual deployment in the MVP stage.
  - Future-ready for cloud deployment (AWS/Azure, Docker registry).

- **Dockerization**

  - Each service (frontend, backend) containerized with Docker.
  - Containers orchestrated via `docker-compose` for local development.

- **Environment Management**

  - `.env` files for secrets (DB URI, JWT secret, API keys).
  - Secure handling of credentials.

- **Branch Protection Rules**
  - Require linear history (no direct merge commits).
  - Require successful status checks before merging.
  - Enforce pull requests for clean collaboration.

---

## 🔌 WebSocket Integration

Real-time communication is a core part of Siyathuru’s functionality.

- **Technology**: Socket.IO integrated with the backend.
- **Use Cases**:
  - Live RSVP updates for events.
  - Instant community announcements.
  - Real-time chat between members.

This enables Siyathuru to deliver a seamless and interactive experience, keeping users connected with their communities in real time.

---

## 📌 Roadmap

- **Phase 1 (MVP)**: Build the core platform (authentication, communities, events).
- **Phase 2 (Advanced Features)**: Integrate AI for recommendations and file uploads.
- **Phase 3 (Final Deployment)**: Deploy the platform to a cloud environment (AWS/Azure).

---

## 🙋 About

Built by **Kavidu Lakshan**, a final-year student.
This project aims to demonstrate expertise in full-stack development and solve a tangible social problem using technology and AI.
