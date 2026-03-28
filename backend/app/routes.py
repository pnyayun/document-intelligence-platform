import os
import uuid
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from .extensions import db
from .models import Document, Chunk
from .parser import allowed_file, extract_text, get_extension
from .chunker import chunk_text

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

    # Save file securely
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, unique_filename)
    file.save(filepath)

    # Extract text
    try:
        text, page_count = extract_text(filepath, filename)
    except Exception as e:
        os.remove(filepath)
        return jsonify({"error": f"Failed to extract text: {str(e)}"}), 500

    # Save document to database
    doc = Document(
        filename=filename,
        page_count=page_count,
        user_id=None
    )
    db.session.add(doc)
    db.session.flush()  # Get doc.id before committing

    # Chunk the text and save chunks
    chunks = chunk_text(text)
    for chunk in chunks:
        db_chunk = Chunk(
            document_id=doc.id,
            page=None,
            text=chunk['text'],
            token_count=chunk['token_count'],
            vector_id=None  # Will be filled after Qdrant embedding
        )
        db.session.add(db_chunk)

    db.session.commit()

    return jsonify({
        "message": "Document uploaded and chunked successfully",
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