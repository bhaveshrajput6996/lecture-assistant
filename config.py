import os

DB_USER = "root"
DB_PASSWORD = ""
DB_HOST = "127.0.0.1"
DB_PORT = "3306"
DB_NAME = "lecture_assistant"

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "phi3.5"

WHISPER_MODEL_SIZE = "base"  # base/small/medium

STORAGE_AUDIO = "storage/audio"
STORAGE_TRANSCRIPTS = "storage/transcripts"
STORAGE_SUMMARIES = "storage/summaries"
STORAGE_PDF = "storage/pdf"

CHROMADB_PATH = "storage/chromadb"
CHROMADB_COLLECTION = "lectures"

EMBEDDING_MODEL = "all-MiniLM-L6-v2"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
TOP_K_RETRIEVAL = 10
FINAL_CHUNKS = 4