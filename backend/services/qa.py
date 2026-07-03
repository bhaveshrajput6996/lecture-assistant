import requests
from backend.services.prompt_builder import build_qa_prompt

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "phi3.5"


def answer_question(context_chunks: list[str], question: str) -> str:
    """
    Build prompt from context chunks and question,
    send to Ollama, return answer.
    """
    prompt = build_qa_prompt(context_chunks, question)

    response = requests.post(OLLAMA_URL, json={
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    })

    response.raise_for_status()
    return response.json()["response"]