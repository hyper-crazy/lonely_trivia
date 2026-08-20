# Lonely Trivia 🎮

A high-aesthetic, hardcore multiplayer & endless trivia experience built with a modern React frontend and a robust FastAPI backend. 

---

## ✨ Key Features

* **Multiple Immersive Game Modes**:
  * **Topic Sprint**: High-stakes, 10-question timed sprints across specific topics featuring live streak bonuses, live scoring, and local best-score persistence.
  * **Global Gauntlet**: Universal question pools tiered by difficulty for tactical survival runs.
  * **Practice Mode**: Relaxed, endless-question mode designed for warm-ups and casual exploration without competitive leaderboard pressure.
* **Dynamic Feedback & Visuals**: Fluid Framer-motion layout transitions, particle confetti victory celebrations, and precise timer bars.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti.
* **Backend**: Python, FastAPI, Pydantic, Uvicorn, python-dotenv.
* **Data Engine**: Google GenAI SDK integration with automated master dataset generation and Jaccard-similarity deduplication filters.

---

## 🚀 Getting Started

### Prerequisites
* Python 3.11+
* Node.js & npm

### Step 1: Clone and Configure Environment Files

First, ensure your sensitive files (like your Google AI Studio API key) are safely separated from Git tracking.

1. Inside your `backend/` folder, create a `.env` file:
   ```env
   PORT=8000
   HOST=127.0.0.1
   DATABASE_URL=sqlite:///./trivia.db
   GOOGLE_AI_API_KEY=your_actual_google_ai_studio_key_here
2. Inside your `frontend/` folder, create a `.env` file:
   VITE_API_BASE_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)

### Step 2: Run the Backend (FastAPI)

1. Open your terminal window.
2. Navigate to the backend directory:
   cd backend
3. Install the required Python packages (if you haven't already):
   pip install fastapi uvicorn pydantic python-dotenv google-genai
4. Start the FastAPI development server using Uvicorn:
   uvicorn main:app --reload
5. Server will be launched and listen at: http://127.0.0.1:8000 keep running the terminal in background.

### Step 3: Run the Frontend (React + Vite)

1. Open a new terminal window.
2. Navigate to the frontend directory:
   cd frontend
3. Install the frontend dependencies:
   npm install
4. Start the Vite development server:
   npm run dev
5. Click or open the local development link provided in your terminal (typically http://localhost:5173) to open and play the application in your browser!
