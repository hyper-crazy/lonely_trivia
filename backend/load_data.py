import sqlite3
import json
import os

DB_NAME = "trivia.db"
JSON_FILE = "master_dataset.json"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Create the questions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        question TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        distractor_1 TEXT NOT NULL,
        distractor_2 TEXT NOT NULL,
        distractor_3 TEXT NOT NULL
    )
    """)
    
    # Create index for fast retrieval during matches
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_topic_diff ON questions (topic, difficulty)")
    conn.commit()
    return conn

def populate_database():
    if not os.path.exists(JSON_FILE):
        print(f"Error: {JSON_FILE} not found!")
        return

    conn = init_db()
    cursor = conn.cursor()
    
    # Clear existing entries to prevent duplication on re-runs
    cursor.execute("DELETE FROM questions")
    
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    total_inserted = 0
    
    for topic, question_list in data.items():
        for q in question_list:
            cursor.execute("""
            INSERT INTO questions (topic, difficulty, question, correct_answer, distractor_1, distractor_2, distractor_3)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                topic,
                q["difficulty"],
                q["question"],
                q["correct_answer"],
                q["distractors"][0],
                q["distractors"][1],
                q["distractors"][2]
            ))
            total_inserted += 1

    conn.commit()
    conn.close()
    print(f"Successfully loaded {total_inserted} questions into {DB_NAME}!")

if __name__ == "__main__":
    populate_database()