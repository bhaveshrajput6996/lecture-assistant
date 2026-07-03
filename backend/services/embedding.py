from sentence_transformers import SentenceTransformer
from config import EMBEDDING_MODEL


# Load model once at startup
# Can be swapped to bge-small-en-v1.5, nomic-embed-text, e5-large etc.
MODEL_NAME = EMBEDDING_MODEL # just change name and model will change automatically for good system good model

_model = None


def load_model() -> SentenceTransformer:
    global _model

    print("MODEL OBJECT:", _model)
    print("MODEL OBJECT ID:", id(_model))
    if _model is None:
        print(f"[Embedding] It may take 2-3 sec, Loading model!: {MODEL_NAME}")
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]: # output will like [[0.12,-0.45,1320.121,....]]
    """Generate embeddings for a list of text chunks."""
    model = load_model()
    embeddings = model.encode(texts, show_progress_bar=False)
    return embeddings.tolist()


def embed_query(query: str) -> list[float]:
    """Generate embedding for a single query string."""
    model = load_model()
    embedding = model.encode([query], show_progress_bar=False)
    return embedding[0].tolist()