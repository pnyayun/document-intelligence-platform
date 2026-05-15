import os
import uuid
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from .extensions import db
from .models import Document, Chunk
from .parser import allowed_file, extract_text
from .chunker import chunk_text
from .embedder import embed_chunks

main = Blueprint('main', __name__)

@main.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "Flask is running!"}), 200

@main.route('/api/documents/upload', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": "File type not supported",
            "supported_types": "pdf, docx, txt, pptx, xlsx, md, rtf, html, csv"
        }), 400

    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, unique_filename)
    file.save(filepath)

    try:
        text, page_count = extract_text(filepath, filename)
    except Exception as e:
        os.remove(filepath)
        return jsonify({"error": f"Failed to extract text: {str(e)}"}), 500

    doc = Document(
        filename=filename,
        page_count=page_count,
        user_id=None
    )
    db.session.add(doc)
    db.session.flush()

    chunks = chunk_text(text)
    db_chunks = []
    for chunk in chunks:
        db_chunk = Chunk(
            document_id=doc.id,
            page=None,
            text=chunk['text'],
            token_count=chunk['token_count'],
            vector_id=None
        )
        db.session.add(db_chunk)
        db_chunks.append(db_chunk)

    db.session.flush()

    try:
        qdrant_url = current_app.config.get('QDRANT_URL', 'http://localhost:6333')
        collection_name = current_app.config.get('QDRANT_COLLECTION', 'documents')
        vector_ids = embed_chunks(db_chunks, doc.id, qdrant_url, collection_name)

        for db_chunk, vector_id in zip(db_chunks, vector_ids):
            db_chunk.vector_id = vector_id

    except Exception as e:
        db.session.rollback()
        os.remove(filepath)
        return jsonify({"error": f"Failed to embed chunks: {str(e)}"}), 500

    db.session.commit()

    return jsonify({
        "message": "Document uploaded, chunked and embedded successfully",
        "document": doc.to_dict(),
        "chunks_created": len(chunks),
        "text_preview": text[:300] + '...' if len(text) > 300 else text
    }), 201


@main.route('/api/documents', methods=['GET'])
def get_documents():
    documents = Document.query.order_by(Document.uploaded_at.desc()).all()
    return jsonify([doc.to_dict() for doc in documents]), 200


@main.route('/api/documents/<doc_id>', methods=['GET'])
def get_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    chunks = Chunk.query.filter_by(document_id=doc_id).all()
    return jsonify({
        "document": doc.to_dict(),
        "chunks": [c.to_dict() for c in chunks],
        "total_chunks": len(chunks)
    }), 200


@main.route('/api/documents/<doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    db.session.delete(doc)
    db.session.commit()
    return jsonify({"message": "Document deleted"}), 200


@main.route('/api/query', methods=['POST'])
def query_document():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    question = data.get('question')
    document_id = data.get('document_id')

    if not question:
        return jsonify({"error": "No question provided"}), 400

    try:
        qdrant_url = current_app.config.get('QDRANT_URL', 'http://localhost:6333')
        collection_name = current_app.config.get('QDRANT_COLLECTION', 'documents')

        from .embedder import search_similar_chunks
        similar_chunks = search_similar_chunks(
            query=question,
            qdrant_url=qdrant_url,
            collection_name=collection_name,
            document_id=document_id,
            top_k=5
        )

        if not similar_chunks:
            return jsonify({"error": "No relevant chunks found"}), 404

        context = "\n\n".join([chunk['text'] for chunk in similar_chunks])

        # Generate answer with Groq
        from groq import Groq
        groq_client = Groq(
            api_key=current_app.config.get('GROQ_API_KEY')
        )
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant answering questions about a document. Use ONLY the context provided to answer the question. If the answer is not in the context, say 'I couldn't find that information in the document.'"
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"
                }
            ],
            max_tokens=1024
        )
        answer = response.choices[0].message.content

        from .models import Query
        query_record = Query(
            document_id=uuid.UUID(document_id) if document_id else None,
            question=question,
            answer=answer,
            chunks_used=[{
                "chunk_id": c['chunk_id'],
                "score": c['score'],
                "text_preview": c['text'][:100]
            } for c in similar_chunks]
        )
        db.session.add(query_record)
        db.session.commit()

        return jsonify({
            "question": question,
            "answer": answer,
            "chunks_used": similar_chunks,
            "query_id": str(query_record.id)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@main.route('/api/queries', methods=['GET'])
def get_queries():
    from .models import Query
    queries = Query.query.order_by(Query.created_at.desc()).all()
    return jsonify([q.to_dict() for q in queries]), 200