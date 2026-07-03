from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime , UTC
from sqlalchemy.orm import declarative_base
from database.mysql_connection import Base

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(String(36), primary_key=True)
    filename = Column(String(255))
    audio_path = Column(String(500))
    transcript_path = Column(String(500))
    content = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))