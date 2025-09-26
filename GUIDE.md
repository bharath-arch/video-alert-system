# Project RTSP Stream

This document provides instructions on how to set up and run the Project RTSP Stream application.

## Project Overview

Project RTSP Stream is a full-stack application designed to manage and monitor RTSP camera streams. It consists of a web-based frontend for user interaction, a backend server to handle business logic and data persistence, and a worker service to process video streams.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Python](https://www.python.org/) (v3.10 or higher)
- [uv](https://github.com/astral-sh/uv) (Python package installer)
- [Docker](https://www.docker.com/) (for running the database)

## Setup Instructions

The application is divided into three main components: `frontend`, `backend`, and `worker`. Follow the steps below to set up each part.

### 1. Backend Setup

The backend is a Node.js application that uses Hono, Prisma, and TypeScript.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:**
    This project uses PostgreSQL as the database. You can run a PostgreSQL instance using Docker.
    ```bash
    docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
    ```

4.  **Configure environment variables:**
    Create a `.env` file in the `backend` directory by copying the example file:
    ```bash
    cp env.example .env
    ```
    Update the `.env` file with your database credentials.

5.  **Run database migrations:**
    ```bash
    npx prisma migrate dev
    ```

6.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    The backend server will be running on `http://localhost:4000`.

### 2. Frontend Setup

The frontend is a React application built with Vite and TypeScript.

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend application will be accessible at `http://localhost:5173`.

### 3. Worker Setup

The worker is a Python application that uses FastAPI to handle video stream processing.

1.  **Navigate to the worker directory:**
    ```bash
    cd worker
    ```

2.  **Create a virtual environment and install dependencies:**
    ```bash
    uv venv
    uv pip install -r requirements.txt
    ```
    *Note: If `requirements.txt` does not exist, you can install the dependencies from `pyproject.toml`.*
    ```bash
    uv pip install -e .
    ```

3.  **Start the worker server:**
    ```bash
    uvicorn main:app --reload
    ```
    The worker server will be running on `http://localhost:8000`.

## Running the Application

To run the entire application, you will need to start the backend, frontend, and worker servers in separate terminal windows.

1.  **Start the backend:** `cd backend && npm run dev`
2.  **Start the frontend:** `cd frontend && npm run dev`
3.  **Start the worker:** `cd worker && uvicorn main:app --reload`

## API Flow

The following diagram illustrates the API flow between the different services:

```
┌───────────┐          ┌─────────────┐          ┌───────────┐
│ Frontend  │ <------> │   Backend   │ <------> │  Worker   │
└───────────┘          └─────────────┘          └───────────┘
      │                       │                        │
      │  GET /cameras         │                        │
      │──────────────────────>│                        │
      │   List cameras        │                        │
      │<──────────────────────│                        │
      │                       │                        │
      │ POST /cameras         │                        │
      │──────────────────────>│ Save in DB             │
      │                       │                        │
      │ PUT /cameras/:id      │                        │
      │──────────────────────>│ Update in DB           │
      │                       │                        │
      │ DELETE /cameras/:id   │                        │
      │──────────────────────>│ Remove in DB           │
      │                       │                        │
      │ POST /cameras/:id/start                      │
      │──────────────────────>│ Proxy → /worker/start │
      │                       │──────────────────────>│ Start RTSP ingest
      │                       │                        │
      │ POST /cameras/:id/stop                       │
      │──────────────────────>│ Proxy → /worker/stop  │
      │                       │──────────────────────>│ Stop RTSP ingest
```

## Project Structure

The project is organized into the following directories:

-   `backend/`: Contains the Node.js backend application.
-   `frontend/`: Contains the React frontend application.
-   `worker/`: Contains the Python worker for video processing.
-   `infra/`: Contains infrastructure-related files, such as `docker-compose.yml`.
