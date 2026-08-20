import json
import time
import os
import re
from google import genai
from pydantic import BaseModel, Field
from dotenv import load

# Load environment variables from backend/.env
load_dotenv()

class TriviaQuestion(BaseModel):
    difficulty: str = Field(description="Must be exactly 'Easy', 'Medium', or 'Hard'.")
    question: str = Field(description="The trivia question.")
    correct_answer: str = Field(description="The correct, factual answer.")
    distractors: list[str] = Field(
        description="Exactly 3 highly plausible, factually incorrect options. Must be extremely confusing to guess."
    )

class TriviaBatch(BaseModel):
    questions: list[TriviaQuestion]

# --- Similarity Checker ---
def is_too_similar(new_question, existing_questions, threshold=0.7):
    """Checks if a question is worded differently but asks the same thing."""
    def clean_and_tokenize(text):
        clean_text = re.sub(r'[^\w\s]', '', text.lower())
        return set(clean_text.split())

    set1 = clean_and_tokenize(new_question)
    
    for existing_q in existing_questions:
        set2 = clean_and_tokenize(existing_q)
        intersection = set1.intersection(set2)
        union = set1.union(set2)
        if len(union) == 0:
            continue
            
        similarity = len(intersection) / len(union)
        if similarity >= threshold:
            return True # Duplicate
            
    return False

def main():
    # Securely retrieve the API key from environment variables
    api_key = os.getenv("GOOGLE_AI_API_KEY")
    
    if not api_key:
        raise ValueError("CRITICAL: GOOGLE_AI_API_KEY is missing from your backend/.env file!")

    client = genai.Client(api_key=api_key)
    
    topics = ["Geography", "Science", "History", "Movies", "Sports", "Literature", "Technology", "Art", "Food & Drink", "Mythology",
              "Politics", "Nature", "Space", "Languages", "Religion"]
    target_per_topic = 300
    master_file = "master_dataset.json"

    if os.path.exists(master_file):
        with open(master_file, "r", encoding="utf-8") as f:
            dataset = json.load(f)
    else:
        dataset = {topic: [] for topic in topics}

    for topic in topics:
        if topic not in dataset:
            dataset[topic] = []

        print(f"\n--- Starting Topic: {topic} ---")
        
        while len(dataset[topic]) < target_per_topic:
            current_count = len(dataset[topic])
            print(f"[{topic}] Current Count: {current_count}/{target_per_topic}. Fetching new batch...")

            prompt = f"""
            Generate 20 completely unique trivia questions about {topic}.
            Difficulty MUST be: 5 Easy, 12 Medium, 3 Hard.
            DO NOT repeat any common knowledge facts. Ensure subjects are vastly different from standard trivia.
            """

            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash', # Updated to current model identifier if needed
                    contents=prompt,
                    config={
                        'response_mime_type': 'application/json',
                        'response_schema': TriviaBatch,
                        'temperature': 0.85, 
                    },
                )
                
                output_data = json.loads(response.text)
                
                existing_question_strings = [q["question"] for q in dataset[topic]]
                added_this_batch = 0
                rejected_this_batch = 0

                for new_q in output_data["questions"]:
                    if not is_too_similar(new_q["question"], existing_question_strings):
                        dataset[topic].append(new_q)
                        existing_question_strings.append(new_q["question"])
                        added_this_batch += 1
                    else:
                        rejected_this_batch += 1

                with open(master_file, "w", encoding="utf-8") as f:
                    json.dump(dataset, f, indent=4)
                
                print(f"[{topic}] +{added_this_batch} unique saved (Rejected {rejected_this_batch} similar).")
                time.sleep(10) 

            except Exception as e:
                print(f"API Error or Rate Limit Hit: {e}")
                print("Cooling down for 30 seconds before retrying...")
                time.sleep(30)

    print("\n=========================================")
    print("     FINAL DATASET GENERATION REPORT     ")
    print("=========================================")
    for topic in topics:
        final_count = len(dataset[topic])
        print(f"{topic}: {final_count} verified questions")
    print("=========================================")
    print("All topics have successfully reached their targets!")

if __name__ == "__main__":
    main()