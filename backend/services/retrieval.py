from backend.services.vector_store import retrieve_relevant_chunks


def get_context(audio_id: str, question: str, top_k: int = 10) -> list[str]:
    """
    Retrieve the most relevant context chunks for a question.
    """
    return retrieve_relevant_chunks(audio_id, question, top_k=top_k)