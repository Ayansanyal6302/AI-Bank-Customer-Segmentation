from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
import datetime
from database import Base

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Using Text/LONGTEXT to store serialized JSON data for flexibility with different dataset schemas
    # Some MySQL versions support JSON column, but Text is universally safe for large datasets when serialized
    original_data = Column(Text(4294967295)) # LONGTEXT in MySQL
    processed_data = Column(Text(4294967295)) 
    cluster_results = Column(Text(4294967295))
    
    k_value = Column(Integer, nullable=True)
    insights = Column(Text(4294967295))
