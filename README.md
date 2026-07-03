# Lecture Assistant

AI-powered lecture assistant with speech-to-text, summarization, and Q&A over lecture content.

## Project Structure

- `main.py` — FastAPI application entry point
- `backend/` — API routes, services, and utilities
- `database/` — MySQL connection and models
- `speech_to_text/` — Whisper transcription
- `rag/` — RAG pipeline (chunking, embeddings, ChromaDB)
- `llm/` — Local LLM via Ollama
- `frontend/` — Streamlit UI
- `storage/` — Audio, transcripts, summaries, and PDFs
- `tests/` — Unit tests

## Setup

1. Create a virtual environment and install dependencies:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Copy `.env` and fill in your database credentials and model settings.

3. Start the API:

   ```bash
   uvicorn main:app --reload
   ```

4. Start the Streamlit frontend:

   ```bash
   streamlit run frontend/app.py
   ```

## API Endpoints

- `POST /api/audio/upload` — Upload lecture audio
- `POST /api/summary/generate` — Generate lecture summary
- `POST /api/chat/ask` — Ask questions about a lecture
