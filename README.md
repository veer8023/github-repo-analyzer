# GitHub Repository Analyzer

This project is a full-stack web application that allows users to input a GitHub repository URL and view various statistics and insights about it, including repository metadata, contributor information, and commit activity.

## Features

*   Fetches and displays general repository information (name, description, stars, forks, etc.).
*   Lists repository contributors and their contribution counts.
*   Visualizes weekly commit activity over the last year using a bar chart.
*   Responsive design for use on different screen sizes.
*   Backend API to interact with the GitHub REST API v3.
*   Dockerized for easy setup and deployment.

## Tech Stack

*   **Frontend**: React, Vite, TypeScript, Tailwind CSS, Chart.js (via react-chartjs-2)
*   **Backend**: Node.js, Express.js, node-fetch
*   **Database**: None (stateless, fetches data directly from GitHub API)
*   **Deployment**: Docker, Docker Compose

## Prerequisites

*   Node.js (v18 or later recommended)
*   npm (comes with Node.js)
*   Git
*   Docker Desktop (for Dockerized setup)
*   A GitHub Personal Access Token (PAT) with `public_repo` scope. See [GitHub Docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) for instructions on creating a PAT.

## Project Structure

```
github-repo-analyzer/
├── backend/         # Node.js/Express backend application
│   ├── Dockerfile
│   ├── .env.example # Example environment file
│   ├── package.json
│   └── server.js    # Main backend logic
├── frontend/        # React/Vite frontend application
│   ├── Dockerfile
│   ├── package.json
│   ├── src/         # Frontend source code
│   └── vite.config.js
├── .gitignore
├── docker-compose.yml # Docker Compose configuration
└── README.md          # This file
```

## Environment Variables

The backend requires a GitHub Personal Access Token to interact with the GitHub API. Create a `.env` file in the `backend/` directory by copying `backend/.env.example` (if it exists) or creating it manually:

`backend/.env`:
```
GITHUB_TOKEN=your_github_personal_access_token_here
PORT=5000
```

*   `GITHUB_TOKEN`: Your GitHub PAT.
*   `PORT`: (Optional) The port the backend server will run on (defaults to 5000).

The frontend uses `VITE_API_URL` to know where the backend is. This is typically set automatically when running locally or via Docker Compose.

## Local Development Setup

### 1. Clone the Repository (if you haven't already)

```bash
git clone https://github.com/veer8023/github-repo-analyzer.git
cd github-repo-analyzer
```

### 2. Setup Backend

```bash
cd backend
npm install
# Create and configure your backend/.env file as described above
npm start
```
The backend server will start, typically on `http://localhost:5000`.

### 3. Setup Frontend

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend development server will start, typically on `http://localhost:5173`.

Open `http://localhost:5173` in your browser.

## Docker Setup

This is the recommended way to run the application for a consistent environment.

1.  **Ensure Docker Desktop is running.**
2.  **Configure Backend Environment**: Make sure you have the `backend/.env` file created and configured with your `GITHUB_TOKEN` as described in the "Environment Variables" section.
3.  **Build and Run with Docker Compose**:
    From the project root directory (`github-repo-analyzer-new`):
    ```bash
    docker-compose up --build
    ```
    This command will build the Docker images for both frontend and backend services and then start them.

4.  **Access the Application**:
    Open `http://localhost:5173` in your web browser.

To stop the Docker containers:
```bash
docker-compose down
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is open source and available under the MIT License. (You can add a LICENSE file if you wish)
