from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import requests
import os
import json
from pydantic import BaseModel
from typing import List, Optional

# --- Gemini API Setup ---
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_KEY = "" #API KEY
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"
# if not GEMINI_API_KEY:
#     raise RuntimeError("GEMINI_API_KEY environment variable not set. Please set your Gemini API key.")

def call_gemini(prompt: str):
    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_API_KEY}
    data = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, params=params, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        # Extract the text response
        return result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        return f"Error calling Gemini API: {str(e)}"

# Initialize FastAPI, Embedding Model, and ChromaDB
app = FastAPI(title="Study Buddy API", version="1.0.0")

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Set up ChromaDB (in-memory)
chroma_client = chromadb.Client(Settings())
collection = chroma_client.create_collection("pdf_chunks")

# Pydantic models
class ExplainRequest(BaseModel):
    question: str

class QuizRequest(BaseModel):
    topic: str
    num_questions: int = 5

class FlashCardRequest(BaseModel):
    topic: str
    num_cards: int = 10

# Helper Function: Split Text into Chunks
def split_text(text, max_length=500):
    paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
    chunks = []
    current = ""
    for para in paragraphs:
        if len(current) + len(para) < max_length:
            current += " " + para
        else:
            if current:
                chunks.append(current.strip())
            current = para
    if current:
        chunks.append(current.strip())
    return chunks

# Helper Function: Get relevant context from ChromaDB
def get_relevant_context(query: str, n_results: int = 2):
    q_embedding = embedder.encode([query]).tolist()[0]
    results = collection.query(
        query_embeddings=[q_embedding],
        n_results=n_results
    )
    return "\n".join(results['documents'][0])

# PDF Upload Endpoint
@app.post("/upload_pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    
    text = ""
    with pdfplumber.open(temp_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    os.remove(temp_path)
    
    chunks = split_text(text)
    embeddings = embedder.encode(chunks).tolist()
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids
    )
    return {
        "num_chunks": len(chunks),
        "message": "PDF processed and chunks stored for retrieval."
    }

# RAG Endpoint: Explain Concept
@app.post("/explain/")
def explain_concept(req: ExplainRequest):
    context = get_relevant_context(req.question)
    prompt = (
        f"Use the following context from a textbook to answer the question simply and clearly:\n\n"
        f"{context}\n\n"
        f"Question: {req.question}\n"
        f"Provide a clear, simple explanation:"
    )
    answer = call_gemini(prompt)
    return {"answer": answer}

# Quiz Generation Endpoint
@app.post("/generate_quiz/")
def generate_quiz(req: QuizRequest):
    context = get_relevant_context(req.topic, n_results=2)
    prompt = (
        f"Based on the following educational content, generate {req.num_questions} multiple choice questions:\n\n"
        f"{context}\n\n"
        f"Generate {req.num_questions} questions in this exact JSON format:\n"
        f'[{{"question": "Question text?", "options": ["A", "B", "C", "D"], "correct_answer": "A", "explanation": "Why this is correct"}}]\n'
        f"Make sure the questions are relevant to the topic and vary in difficulty."
    )
    
    response = call_gemini(prompt)
    
    try:
        # Try to extract JSON from the response
        if "[" in response and "]" in response:
            start = response.find("[")
            end = response.rfind("]") + 1
            json_str = response[start:end]
            questions = json.loads(json_str)
        else:
            # Fallback: create a simple question
            questions = [{
                "question": f"What is {req.topic}?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A",
                "explanation": "Based on the provided content"
            }]
        
        return {"questions": questions}
    except json.JSONDecodeError:
        return {"questions": [{
            "question": f"Error parsing quiz for {req.topic}",
            "options": ["Try again", "Check Gemini", "Verify content", "Contact support"],
            "correct_answer": "Try again",
            "explanation": "There was an error generating the quiz"
        }]}

# Flash Card Generation Endpoint
@app.post("/generate_flashcards/")
def generate_flashcards(req: FlashCardRequest):
    context = get_relevant_context(req.topic, n_results=2)
    prompt = (
        f"Based on the following educational content, generate {req.num_cards} flash cards:\n\n"
        f"{context}\n\n"
        f"Generate {req.num_cards} flash cards in this exact JSON format:\n"
        f'[{{"front": "Question or term", "back": "Answer or definition"}}]\n'
        f"Make sure the cards cover key concepts from the topic."
    )
    
    response = call_gemini(prompt)
    
    try:
        # Try to extract JSON from the response
        if "[" in response and "]" in response:
            start = response.find("[")
            end = response.rfind("]") + 1
            json_str = response[start:end]
            cards = json.loads(json_str)
        else:
            # Fallback: create a simple card
            cards = [{
                "front": f"What is {req.topic}?",
                "back": "Based on the provided content"
            }]
        
        return {"cards": cards}
    except json.JSONDecodeError:
        return {"cards": [{
            "front": f"Error parsing flash cards for {req.topic}",
            "back": "There was an error generating the flash cards"
        }]}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Study Buddy API is running"}

# Get available topics (based on stored chunks)
@app.get("/topics")
def get_topics():
    try:
        # Get a sample of documents to suggest topics
        results = collection.get(limit=10)
        if results['documents']:
            # Extract potential topics from document content
            topics = []
            for doc in results['documents'][:5]:
                # Simple topic extraction - first few words
                words = doc.split()[:5]
                topic = " ".join(words)
                if len(topic) > 10:
                    topics.append(topic[:50] + "...")
            return {"topics": topics}
        else:
            return {"topics": ["Upload a PDF first to see topics"]}
    except:
        return {"topics": ["No documents available"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)