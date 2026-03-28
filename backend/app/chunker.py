import tiktoken
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Tokenizer for counting tokens (using GPT tokenizer as standard)
def get_tokenizer():
    return tiktoken.get_encoding("cl100k_base")

def count_tokens(text):
    tokenizer = get_tokenizer()
    return len(tokenizer.encode(text))

def chunk_text(text, chunk_size=500, chunk_overlap=50):
    """
    Splits text into overlapping chunks.
    
    Args:
        text: The full extracted text
        chunk_size: Max tokens per chunk (default 500)
        chunk_overlap: Overlapping tokens between chunks (default 50)
                       Overlap ensures context is not lost at chunk boundaries
    
    Returns:
        List of dicts with chunk text and token count
    """
    if not text or not text.strip():
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=count_tokens,
        separators=["\n\n", "\n", ". ", "! ", "? ", ", ", " ", ""]
    )

    raw_chunks = splitter.split_text(text)

    chunks = []
    for i, chunk_text in enumerate(raw_chunks):
        token_count = count_tokens(chunk_text)
        chunks.append({
            "index": i,
            "text": chunk_text.strip(),
            "token_count": token_count
        })

    return chunks