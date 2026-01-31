from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql.expression import text

from .database import Base



class Source(Base):
    __tablename__ = "SOURCES"
    
    ID = Column(Integer, primary_key = True, nullable = False)
    SOURCE_NAME = Column(String, nullable = False)
    ETL_CREATED_TIME = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
    
class Keyword(Base):
    __tablename__ = "KEYWORDS"
    
    ID = Column(Integer, primary_key = True, nullable = False)
    KEYWORD = Column(String, nullable = False)
    INSTANCES = Column(Integer, nullable = False)
    SOURCE_ID = Column(Integer, ForeignKey("SOURCES.ID", ondelete="CASCADE"), nullable=False)
    ETL_CREATED_TIME = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

class Chunk(Base):
    __tablename__ = "CHUNKS" 

    ID = Column(Integer, primary_key = True, nullable = False)
    CHUNK_TEXT = Column(String, nullable = False)
    SOURCE_ID = Column(Integer, ForeignKey("SOURCES.ID", ondelete="CASCADE"), nullable=False)
    ETL_CREATED_TIME = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

class Junction(Base):
    __tablename__ = "JUNCTIONS"
    ID = Column(Integer, primary_key = True, nullable = False)
    SOURCE_ID = Column(Integer, ForeignKey("SOURCES.ID", ondelete="CASCADE"), nullable=False)
    CHUNK_ID = Column(Integer, ForeignKey("CHUNKS.ID", ondelete="CASCADE"), nullable=False)
    KEYWORD_ID = Column(Integer, ForeignKey("KEYWORDS.ID", ondelete="CASCADE"), nullable=False)
    ETL_CREATED_TIME = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))

class Summary(Base):
    __tablename__ = "SUMMARIES"
    ID = Column(Integer, primary_key = True, nullable = False)
    SOURCE_ID = Column(Integer, ForeignKey("SOURCES.ID", ondelete="CASCADE"), nullable=False)
    KEYWORD_ID = Column(Integer, ForeignKey("KEYWORDS.ID", ondelete="CASCADE"), nullable=False)
    SUMMARY_TEXT = Column(Text, nullable = False)
    ETL_CREATED_TIME = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))