import whisper
import os

model = whisper.load_model("base")

def transcribe_audio(audio_path: str) -> dict:
    result = model.transcribe(audio_path)
    return {
        "text": result["text"],
        "segments": result.get("segments", [])
    }