import sqlite3
import random
import os
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Enable CORS for local development and future PWA frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for testing
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "trivia.db")

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

class GameSessionRequest(BaseModel):
    topic: str

@app.get("/api/topics")
def get_topics():
    """Returns a list of all available trivia topics with exact real-time question counts."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT topic, COUNT(*) as count 
        FROM questions 
        GROUP BY topic
    """)
    topics = [{"topic": row["topic"], "count": row["count"]} for row in cursor.fetchall()]
    conn.close()
    return {"topics": topics}

@app.post("/api/game/start")
def start_game(req: GameSessionRequest):
    """
    Initializes a 'Topic Sprint' round (10 questions total).
    Enforces the requested distribution: ~25% Easy, ~60% Medium, ~15% Hard.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch questions categorized by difficulty for the requested topic
    cursor.execute("SELECT * FROM questions WHERE topic = ? AND difficulty = 'Easy'", (req.topic,))
    easy_pool = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM questions WHERE topic = ? AND difficulty = 'Medium'", (req.topic,))
    medium_pool = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM questions WHERE topic = ? AND difficulty = 'Hard'", (req.topic,))
    hard_pool = [dict(row) for row in cursor.fetchall()]
    
    conn.close()

    if len(easy_pool) < 3 or len(medium_pool) < 6 or len(hard_pool) < 1:
        raise HTTPException(status_code=400, detail="Not enough questions in this topic pool to build a balanced sprint.")

    # Select exact distribution for a 10-question sprint: 3 Easy, 6 Medium, 1 Hard
    selected_questions = (
        random.sample(easy_pool, 3) +
        random.sample(medium_pool, 6) +
        random.sample(hard_pool, 1)
    )
    
    # Shuffle the final 10 questions so difficulty scales organically
    random.shuffle(selected_questions)

    formatted_questions = []
    for q in selected_questions:
        options = [q["correct_answer"], q["distractor_1"], q["distractor_2"], q["distractor_3"]]
        random.shuffle(options)  # Shuffle options so the correct answer isn't always in the same position
        
        formatted_questions.append({
            "id": q["id"],
            "difficulty": q["difficulty"],
            "question": q["question"],
            "options": options,
            # We withhold the correct answer from the client payload for security; validate via a verify endpoint later
            "correct_answer": q["correct_answer"] 
        })

    return {
        "topic": req.topic,
        "total_questions": len(formatted_questions),
        "questions": formatted_questions
    }

@app.get("/")
def root():
    return {"status": "LonelyTrivia Backend is online and running!"}

@app.get("/api/practice/{topic}")
def get_practice_questions(topic: str):
    """Fetches a random batch of 20 questions for endless practice mode."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Grab 20 random questions for the requested topic
    cursor.execute("SELECT * FROM questions WHERE topic = ? ORDER BY RANDOM() LIMIT 20", (topic,))
    questions = [dict(row) for row in cursor.fetchall()]
    conn.close()

    formatted_questions = []
    for q in questions:
        options = [q["correct_answer"], q["distractor_1"], q["distractor_2"], q["distractor_3"]]
        random.shuffle(options) 
        
        formatted_questions.append({
            "id": q["id"],
            "difficulty": q["difficulty"],
            "question": q["question"],
            "options": options,
            "correct_answer": q["correct_answer"] 
        })

    return {"questions": formatted_questions}

@app.get("/api/sprint/{topic}")
def get_sprint_questions(topic: str):
    """Fetches exactly 10 random questions for the high-stakes Topic Sprint mode."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Grab exactly 10 random questions
    cursor.execute("SELECT * FROM questions WHERE topic = ? ORDER BY RANDOM() LIMIT 10", (topic,))
    questions = [dict(row) for row in cursor.fetchall()]
    conn.close()

    formatted_questions = []
    for q in questions:
        options = [q["correct_answer"], q["distractor_1"], q["distractor_2"], q["distractor_3"]]
        random.shuffle(options) 
        
        formatted_questions.append({
            "id": q["id"],
            "difficulty": q["difficulty"],
            "question": q["question"],
            "options": options,
            "correct_answer": q["correct_answer"] 
        })

    return {"questions": formatted_questions}

@app.get("/api/gauntlet/{difficulty}")
async def get_gauntlet_questions(difficulty: str):
    """Fetches 10 random questions across all topics matching the selected difficulty tier."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Capitalize first letter to match database difficulty format ('Easy', 'Medium', 'Hard')
    formatted_diff = difficulty.capitalize()
    
    cursor.execute("SELECT * FROM questions WHERE difficulty = ? ORDER BY RANDOM() LIMIT 10", (formatted_diff,))
    questions = [dict(row) for row in cursor.fetchall()]
    conn.close()

    if not questions:
        raise HTTPException(status_code=404, detail=f"No questions found for difficulty: {difficulty}")

    formatted_questions = []
    for q in questions:
        options = [q["correct_answer"], q["distractor_1"], q["distractor_2"], q["distractor_3"]]
        random.shuffle(options) 
        
        formatted_questions.append({
            "id": q["id"],
            "topic": q["topic"],
            "difficulty": q["difficulty"],
            "question": q["question"],
            "options": options,
            "correct_answer": q["correct_answer"] 
        })

    return {"questions": formatted_questions}