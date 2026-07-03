from fastapi import FastAPI, UploadFile, File
from database.models import Transcript
from database.mysql_connection import SessionLocal
from backend.services.transcription import transcribe_audio
from backend.services.summarization import summarize_transcript
from backend.services.rag_pipeline import index_transcript, answer
from backend.services.vector_store import delete_vectors
import shutil, uuid, os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "running"}


# ─── UPLOAD AUDIO ────────────────────────────────────────────
@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    audio_id = str(uuid.uuid4())
    audio_path = f"storage/audio/{audio_id}_{file.filename}"

    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = transcribe_audio(audio_path)

    transcript_path = f"storage/transcripts/{audio_id}.txt"
    with open(transcript_path, "w", encoding="utf-8") as f:
        f.write(result["text"])

    # Save to MySQL
    db = SessionLocal()
    try:
        record = Transcript(
            id=audio_id,
            filename=file.filename,
            audio_path=audio_path,
            transcript_path=transcript_path,
            content=result["text"]
        )
        db.add(record)
        db.commit()
    finally:
        db.close()

    # Index into ChromaDB
    index_transcript(audio_id, result["text"], file_name=file.filename)

    return {
        "audio_id": audio_id,
        "transcript": result["text"]
    }


# ─── SUMMARIZE ───────────────────────────────────────────────
@app.post("/summarize/{audio_id}")
async def summarize(audio_id: str):
    db = SessionLocal()
    try:
        record = db.query(Transcript).filter(Transcript.id == audio_id).first()
        if not record:
            return {"error": "Transcript not found"}

        summary = summarize_transcript(record.content)

        # Save summary to file
        summary_path = f"storage/summaries/{audio_id}.txt"
        with open(summary_path, "w", encoding="utf-8") as f:
            f.write(summary)

        return {
            "audio_id": audio_id,
            "summary": summary,
            "summary_path": summary_path
        }
    finally:
        db.close()


# ─── Q&A ─────────────────────────────────────────────────────
@app.post("/ask/{audio_id}")
async def ask_question(audio_id: str, question: str):
    result = answer(audio_id, question)
    return {
        "audio_id": audio_id,
        "question": question,
        "answer": result["answer"],
        "chunks_used": result["chunks_used"]
    }


# ─── REINDEX ─────────────────────────────────────────────────
@app.post("/reindex/{audio_id}")
async def reindex(audio_id: str):
    db = SessionLocal()
    try:
        record = db.query(Transcript).filter(Transcript.id == audio_id).first()
        if not record:
            return {"error": "Transcript not found"}

        delete_vectors(audio_id)
        total_chunks = index_transcript(audio_id, record.content, file_name=record.filename)

        return {
            "audio_id": audio_id,
            "message": "Reindexed successfully",
            "total_chunks": total_chunks
        }
    finally:
        db.close()


# ─── DELETE LECTURE ──────────────────────────────────────────
@app.delete("/lecture/{audio_id}")
async def delete_lecture_endpoint(audio_id: str):
    db = SessionLocal()
    try:
        record = db.query(Transcript).filter(Transcript.id == audio_id).first()
        if not record:
            return {"error": "Lecture not found"}

        if record.audio_path and os.path.exists(record.audio_path):
            os.remove(record.audio_path)

        if record.transcript_path and os.path.exists(record.transcript_path):
            os.remove(record.transcript_path)

        summary_path = f"storage/summaries/{audio_id}.txt"
        if os.path.exists(summary_path):
            os.remove(summary_path)

        delete_vectors(audio_id)

        db.delete(record)
        db.commit()

        return {
            "audio_id": audio_id,
            "message": "Lecture deleted completely — audio, transcript, summary, vectors, and database record removed."
        }
    finally:
        db.close()