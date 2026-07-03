from backend.services.chunking import chunk_transcript
from backend.services.vector_store import store_chunks
from backend.services.retrieval import get_context
from backend.services.qa import answer_question


def index_transcript(audio_id: str, transcript: str, file_name: str = ""):
    print("INDEX_TRANSCRIPT CALLED")
    """
    Full indexing pipeline:
    Transcript → Chunks → Embeddings → ChromaDB
    """
    print(f"[RAG] Indexing transcript for audio_id={audio_id}")
    chunks = chunk_transcript(transcript)
    print('chunks:',len(chunks))
    store_chunks(audio_id, chunks, file_name=file_name)
    print(f"[RAG] Indexing complete. Total chunks: {len(chunks)}")
    return len(chunks)


def retrieve_context(audio_id: str, question: str, top_k: int = 10) -> list[str]:   
    """
    Retrieve relevant chunks for a question from ChromaDB.
    """
    return get_context(audio_id, question, top_k=top_k)


def answer(audio_id: str, question: str) -> dict:
    """
    Full Q&A pipeline:
    Question → Embed → Retrieve → Rerank → Prompt → Ollama → Answer
    """
    print(f"[RAG] Question received for audio_id={audio_id}: {question}")
    context_chunks = retrieve_context(audio_id, question)

    if not context_chunks:
        return {
            "answer": "This topic was not covered in lecture!\nFill free to ask another Question",
            "chunks_used": 0
        }

    response = answer_question(context_chunks, question)

    return {
        "answer": response,
        "chunks_used": len(context_chunks)
    }