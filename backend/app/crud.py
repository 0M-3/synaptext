from sqlalchemy.orm import Session

from . import models, schemas

def create_source(db: Session, source: schemas.SourceCreate):
    db_source = models.Source(SOURCE_NAME=source.SOURCE_NAME)
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

def create_keyword(db: Session, keyword: schemas.KeywordCreate, source_id: int):
    db_keyword = models.Keyword(**keyword.model_dump(), SOURCE_ID=source_id)
    db.add(db_keyword)
    db.commit()
    db.refresh(db_keyword)
    return db_keyword

def create_chunk(db:Session, chunk: schemas.ChunkCreate, source_id: int):
    db_chunk = models.Chunk(**chunk.model_dump(), SOURCE_ID=source_id)
    db.add(db_chunk)
    db.commit()
    db.refresh(db_chunk)
    return db_chunk
