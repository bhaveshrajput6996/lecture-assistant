import os


def load_template(filename: str) -> str:
    path = os.path.join("prompts", filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def build_qa_prompt(context_chunks: list[str], question: str) -> str:
    template = load_template("qa_prompt.txt")
    context = "\n\n".join(context_chunks)
    prompt = template.replace("{context}", context).replace("{question}", question)
    return prompt


def build_summary_prompt(transcript: str) -> str:
    template = load_template("summary_prompt.txt")
    prompt = template.replace("{transcript}", transcript)
    return prompt