# Project RTSP

This document provides a comprehensive guide to understanding, setting up, and running Project RTSP.

## 1. Overview

Project RTSP is a full-stack application designed for real-time monitoring and analysis of RTSP (Real-Time Streaming Protocol) video streams. It allows users to add, manage, and view camera feeds through a web interface. The system automatically detects faces in the video streams, captures snapshots, and sends alerts.

### Key Features

- **Web-Based Management:** A React-based frontend to add, configure, and monitor camera streams.
- **Real-Time Face Detection:** A Python worker service uses OpenCV and MediaPipe to perform real-time face detection on active streams.
- **Alerting System:** When a face is detected, the worker captures a snapshot and sends an alert to the backend.
- **Data Persistence:** A PostgreSQL database stores user data, camera configurations, and alert information.
- **Containerized Deployment:** The entire application stack (frontend, backend, worker, database) can be easily deployed using Docker Compose.

## 2. Architecture

The application consists of three core services orchestrated by Docker Compose:

- **Frontend:** A React single-page application that provides the user interface. It communicates with the backend via a REST API.
- **Backend:** A Node.js (Hono) application that serves the API. It handles user authentication, manages camera configurations, and stores alerts. It acts as a proxy for the worker service.
- **Worker:** A Python (FastAPI) service that performs the heavy lifting of video processing. It connects to RTSP streams, runs face detection models, and sends alerts back to the backend.

```
┌───────────┐      REST API      ┌─────────────┐      Internal API      ┌───────────┐
│ Frontend  │<------------------->│   Backend   │<---------------------->│  Worker   │
│ (React)   │                    │ (Node.js)   │                      │ (Python)  │
└───────────┘                    └──────┬──────┘                      └─────┬─────┘
                                        │                                  │
                                        │                                  │ connects to
                                        ▼                                  ▼
                                ┌───────────┐                        ┌───────────┐
                                │ Database  │                        │RTSP Stream│
                                │(Postgres) │                        └───────────┘
                                └───────────┘
```

## 3. Tech Stack

| Component  | Technologies                                           |
| :--------- | :----------------------------------------------------- |
| **Frontend** | React, TypeScript, Vite, Material-UI, Tailwind CSS     |
| **Backend**  | Node.js, Hono, Prisma, TypeScript                      |
| **Worker**   | Python, FastAPI, OpenCV, MediaPipe, aiohttp            |
| **Database** | PostgreSQL                                             |
| **Infra**    | Docker, Docker Compose                                 |

## 4. Getting Started (Docker)

Running the application with Docker is the recommended method.

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Step 1: Configuration

You need to set up environment files for the backend and worker services.

**1. Backend Environment (`backend/.env`)**

Create a file named `.env` in the `backend` directory with the following content. This configures the database connection.

```env
# PostgreSQL connection URL
DATABASE_URL="postgresql://user:password@postgres:5432/rtsp_db?schema=public"
```

**2. Worker Environment (`worker/.env`)**

Create a file named `.env` in the `worker` directory. This tells the worker how to communicate with the backend.

```env
# URL for the backend service
BACKEND_URL="http://backend:4000/api"

# URL the backend uses to reach the worker for snapshots
WORKER_URL="http://worker:8000"
```

### Step 2: Build and Run

1.  **Build and start all services:**
    Open your terminal in the project root and run:
    ```bash
    docker-compose up --build -d
    ```
    The `-d` flag runs the containers in detached mode.

2.  **Initialize the Database:**
    The first time you run the application, you need to apply the database schema.
    ```bash
    docker-compose exec backend npx prisma db push
    ```

3.  **Access the Application:**
    The frontend is now accessible at **http://localhost:8080**.

### Useful Docker Commands

-   **View logs for all services:**
    ```bash
    docker-compose logs -f
    ```
-   **View logs for a specific service (e.g., worker):**
    ```bash
    docker-compose logs -f worker
    ```
-   **Stop and remove all containers:**
    ```bash
    docker-compose down
    ```

## 5. Manual Setup (for Development)

For developers who prefer to run services locally without Docker.

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- `uv` (Python package manager)
- A running PostgreSQL instance.

### 1. Backend

1.  Navigate to the `backend` directory.
2.  Install dependencies: `npm install`
3.  Create a `.env` file and set `DATABASE_URL` to your local PostgreSQL instance.
4.  Apply schema: `npx prisma db push`
5.  Start server: `npm run dev` (runs on `http://localhost:4000`)

### 2. Frontend

1.  Navigate to the `frontend` directory.
2.  Install dependencies: `npm install`
3.  Start server: `npm run dev` (runs on `http://localhost:5173`)

### 3. Worker

1.  Navigate to the `worker` directory.
2.  Create a virtual environment: `uv venv`
3.  Install dependencies: `uv pip install -r requirements.txt`
4.  Create a `.env` file and set `BACKEND_URL` to `http://localhost:4000/api`.
5.  Start server: `uvicorn main:app --reload` (runs on `http://localhost:8000`)