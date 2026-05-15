import uuid
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct,
    Filter, FieldCondition, MatchValue
)

print("Loading embedding model...")
_model = SentenceTransformer('all-MiniLM-L6-v2')
VECTOR_SIZE = 384
print("Embedding model loaded!")

_qdrant_clients = {}


def get_qdrant_client(qdrant_url):
    if qdrant_url not in _qdrant_clients:
        _qdrant_clients[qdrant_url] = QdrantClient(url=qdrant_url)
    return _qdrant_clients[qdrant_url]


def ensure_collection_exists(client, collection_name):
    existing = {c.name for c in client.get_collections().collections}
    if collection_name not in existing:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
        )


def embed_chunks(chunks, document_id, qdrant_url, collection_name):
    client = get_qdrant_client(qdrant_url)
    ensure_collection_exists(client, collection_name)

    texts = [chunk.text for chunk in chunks]
    embeddings = _model.encode(texts, show_progress_bar=False)

    points = []
    vector_ids = []

    for chunk, embedding in zip(chunks, embeddings):
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

    client.upsert(collection_name=collection_name, points=points)
    return vector_ids


def search_similar_chunks(query, qdrant_url, collection_name, document_id=None, top_k=5):
    client = get_qdrant_client(qdrant_url)
    query_vector = _model.encode(query).tolist()

    query_filter = None
    if document_id:
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="document_id",
                    match=MatchValue(value=str(document_id))
                )
            ]
        )

    results = client.query_points(
        collection_name=collection_name,
        query=query_vector,
        query_filter=query_filter,
        limit=top_k,
        with_payload=True
    ).points

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