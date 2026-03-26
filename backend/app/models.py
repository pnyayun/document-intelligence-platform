import uuid
from datetime import datetime, timezone
from .extensions import db

class Document(db.Model):
    __tablename__ = 'documents'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = db.Column(db.Text, nullable=False)
    page_count = db.Column(db.Integer, nullable=True)
    uploaded_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user_id = db.Column(db.UUID(as_uuid=True), nullable=True)

    chunks = db.relationship('Chunk', backref='document', lazy=True, cascade='all, delete-orphan')
    queries = db.relationship('Query', backref='document', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": str(self.id),
            "filename": self.filename,
            "page_count": self.page_count,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "user_id": str(self.user_id) if self.user_id else None
        }


class Chunk(db.Model):
    __tablename__ = 'chunks'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('documents.id'), nullable=False)
    page = db.Column(db.Integer, nullable=True)
    text = db.Column(db.Text, nullable=False)
    token_count = db.Column(db.Integer, nullable=True)
    vector_id = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "document_id": str(self.document_id),
            "page": self.page,
            "text": self.text,
            "token_count": self.token_count,
            "vector_id": self.vector_id
        }


class Query(db.Model):
    __tablename__ = 'queries'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('documents.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=True)
    chunks_used = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": str(self.id),
            "document_id": str(self.document_id),
            "question": self.question,
            "answer": self.answer,
            "chunks_used": self.chunks_used,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }