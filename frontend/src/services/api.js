// frontend/src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchTopics() {
  try {
    const res = await fetch(`${API_BASE_URL}/topics`);
    if (!res.ok) throw new Error('Failed to fetch topics');
    const data = await res.json();
    return data.topics;
  } catch (err) {
    console.error("API Error [fetchTopics]:", err);
    throw err;
  }
}

export async function fetchPracticeQuestions(topic) {
  try {
    const res = await fetch(`${API_BASE_URL}/practice/${encodeURIComponent(topic)}`);
    if (!res.ok) throw new Error('Failed to fetch practice questions');
    const data = await res.json();
    return data.questions;
  } catch (err) {
    console.error("API Error [fetchPracticeQuestions]:", err);
    throw err;
  }
}

export async function fetchSprintQuestions(topic) {
  try {
    const res = await fetch(`${API_BASE_URL}/sprint/${encodeURIComponent(topic)}`);
    if (!res.ok) throw new Error('Failed to fetch sprint questions');
    const data = await res.json();
    return data.questions;
  } catch (err) {
    console.error("API Error [fetchSprintQuestions]:", err);
    throw err;
  }
}

export async function fetchGauntletQuestions(difficulty) {
  try {
    const res = await fetch(`${API_BASE_URL}/gauntlet/${encodeURIComponent(difficulty)}`);
    if (!res.ok) throw new Error('Failed to fetch gauntlet questions');
    const data = await res.json();
    return data.questions;
  } catch (err) {
    console.error("API Error [fetchGauntletQuestions]:", err);
    throw err;
  }
}