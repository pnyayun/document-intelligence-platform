import tiktoken
from langchain_text_splitters import RecursiveCharacterTextSplitter

_tokenizer = tiktoken.get_encoding("cl100k_base")


def count_tokens(text):
    return len(_tokenizer.encode(text))


def chunk_text(text, chunk_size=500, chunk_overlap=50):
    if not text or not text.strip():
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=count_tokens,
        separators=["\n\n", "\n", ". ", "! ", "? ", ", ", " ", ""]
    )

    return [
        {"text": chunk.strip(), "token_count": count_tokens(chunk)}
        for chunk in splitter.split_text(text)
    ]