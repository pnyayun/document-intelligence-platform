from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct
)
import uuid

print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
VECTOR_SIZE = 384
print("Embedding model loaded!")

def get_qdrant_client(qdrant_url):
    return QdrantClient(url=qdrant_url)

def ensure_collection_exists(client, collection_name):
    existing = [c.name for c in client.get_collections().collections]
    if collection_name not in existing:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE
            )
        )
        print(f"Created Qdrant collection: {collection_name}")
    else:
        print(f"Qdrant collection already exists: {collection_name}")

def embed_chunks(chunks, document_id, qdrant_url, collection_name):
    client = get_qdrant_client(qdrant_url)
    ensure_collection_exists(client, collection_name)

    texts = [chunk.text for chunk in chunks]

    print(f"Generating embeddings for {len(texts)} chunks...")
    embeddings = model.encode(texts, show_progress_bar=False)
    print("Embeddings generated!")

    points = []
    vector_ids = []

    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        vector_id = str(uuid.uuid4())
        vector_ids.append(vector_id)
        points.append(PointStruct(
            id=vector_id,
            vector=embedding.tolist(),
            payload={
                "document_id": str(document_id),
                "chunk_id": str(chunk.id),
                "text": chunk.text,
                "token_count": chunk.token_count,
            }
        ))

    client.upsert(
        collection_name=collection_name,
        points=points
    )
    print(f"Stored {len(points)} vectors in Qdrant!")
    return vector_ids

def search_similar_chunks(query, qdrant_url, collection_name, document_id=None, top_k=5):
    client = get_qdrant_client(qdrant_url)
    query_vector = model.encode(query).tolist()

    query_filter = None
    if document_id:
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="document_id",
                    match=MatchValue(value=str(document_id))
                )
            ]
        )

    results = client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        query_filter=query_filter,
        limit=top_k,
        with_payload=True
    )

    return [
        {
            "chunk_id": r.payload.get("chunk_id"),
            "document_id": r.payload.get("document_id"),
            "text": r.payload.get("text"),
            "token_count": r.payload.get("token_count"),
            "score": round(r.score, 4)
        }
        for r in results
    ]