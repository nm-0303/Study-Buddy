# Study Buddy
Study Buddy is an AI-powered educational tool that helps you learn from your textbooks and notes. It allows you to upload PDFs, ask questions, generate quizzes, and create flashcards using advanced language models and retrieval-augmented generation (RAG).

## Features
- **PDF Upload:** Upload your study materials in PDF format.
- **Explain Concepts:** Ask questions and get simple, clear explanations based on your uploaded content.
- **Quiz Generation:** Automatically generate multiple-choice quizzes on any topic from your materials.
- **Flashcard Generation:** Create flashcards for key concepts and terms.

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repo-url>
cd StudyBuddy cursor
```

### 2. Backend Setup (Python)
- Create a virtual environment and activate it:
  ```bash
  python -m venv venv
  # On Windows:
  venv\Scripts\activate
  # On Mac/Linux:
  source venv/bin/activate
  ```
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Set your Gemini API key in `main.py`:
  ```python
  GEMINI_API_KEY = "your-gemini-api-key"
  ```
- Start the backend server:
  ```bash
  python main.py
  ```

### 3. Frontend Setup (React)
- Go to the frontend directory:
  ```bash
  cd frontend
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Start the React development server:
  ```bash
  npm start
  ```

## Usage
1. Open the frontend in your browser at [http://localhost:3000](http://localhost:3000).
2. Upload a PDF to begin.
3. Use the interface to ask questions, generate quizzes, or create flashcards.

## Notes
- Make sure to set your Gemini API key in `main.py` before running the backend.
- The backend must be running for the frontend to work properly.

---

Enjoy learning with Study Buddy!
