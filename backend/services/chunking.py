from langchain_text_splitters import RecursiveCharacterTextSplitter
 
 
def chunk_transcript(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """
    Split transcript into semantically meaningful chunks
    using RecursiveCharacterTextSplitter.
    Preserves sentence and paragraph boundaries.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", "!", "?", ";", ",", " "],
        length_function=len,
    )
    chunks = splitter.split_text(text)
    return chunks