import chromadb
import uuid
from datetime import datetime
from backend.services.embedding import embed_texts, embed_query
from config import CHROMADB_PATH, CHROMADB_COLLECTION


client = chromadb.PersistentClient(path=CHROMADB_PATH)

COLLECTION_NAME = CHROMADB_COLLECTION


def get_collection():
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )


def store_chunks(audio_id: str, chunks: list[str], file_name: str = ""):
    print("STORE_CHUNKS CALLED")
    """
    Store chunks with embeddings and metadata in ChromaDB.
    Uses single collection filtered by audio_id.
    Uses UUID-based chunk IDs.
    """
    collection = get_collection()
    embeddings = embed_texts(chunks)
    created_at = datetime.utcnow().isoformat()

    ids = []
    metadatas = []

    for i, chunk in enumerate(chunks):
        chunk_id = str(uuid.uuid4())
        ids.append(chunk_id)
        metadatas.append({
            "audio_id": audio_id,
            "chunk_index": i,
            "start_time": 120.5,
            "end_time": 154.2,
            "file_name": file_name,
            "created_at": created_at,
            "speaker": "Unknown",
        })

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=ids,
        metadatas=metadatas,
    )
    print(f"[VectorStore] Stored {len(chunks)} chunks for audio_id={audio_id}")
    print("=" * 50)
    print("Chunks received:", len(chunks))
    print("Embeddings:", len(embeddings))
    print("Audio ID:", audio_id)
    print("=" * 50)


def retrieve_relevant_chunks(audio_id: str, question: str, top_k: int = 10) -> list[str]:
    """
    Retrieve top_k most relevant chunks for a question,
    filtered by audio_id metadata.
    """
    collection = get_collection()
    print("=" * 60)
    print("Collection Count:", collection.count())
    print("Searching Audio ID:", audio_id)
    print("Question:", question)
    print("=" * 60)
    query_embedding = embed_query(question)
    

    test = collection.get()

    print("DOCUMENTS IN DATABASE")
    print(test)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"audio_id": audio_id},
        include=["documents", "metadatas", "distances"]
    )
    print("RAW RESULTS")
    print(results)

    documents = results["documents"][0]
    distances = results["distances"][0]

    # Rerank: sort by distance (lower = more similar for cosine)
    ranked = sorted(zip(distances, documents), key=lambda x: x[0])

    # Return best 4 after reranking
    best_chunks = [doc for _, doc in ranked[:4]]
    return best_chunks


def delete_vectors(audio_id: str):
    """
    Delete all vectors associated with an audio_id.
    Called when a lecture is deleted.
    """
    collection = get_collection()
    results = collection.get(where={"audio_id": audio_id})
    ids_to_delete = results["ids"]

    if ids_to_delete:
        collection.delete(ids=ids_to_delete)
        print(f"[VectorStore] Deleted {len(ids_to_delete)} chunks for audio_id={audio_id}")
    else:
        print(f"[VectorStore] No chunks found for audio_id={audio_id}")