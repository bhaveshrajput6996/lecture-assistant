import requests
from pathlib import Path

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "phi3.5"

PROMPT_PATH = Path(__file__).resolve().parents[2] / "prompts" / "summary_prompt.txt"


def summarize_transcript(transcript: str) -> str:

    with open(PROMPT_PATH, "r", encoding="utf-8") as file:
        prompt_template = file.read()

    prompt = prompt_template.replace("{transcript}", transcript)

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()["response"]