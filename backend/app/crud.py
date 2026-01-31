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

def create_junction(db:Session, junction: schemas.JunctionCreate):
    db_junction = models.Junction(**junction.model_dump())
    db.add(db_junction)
    db.commit()
    db.refresh(db_junction)
    return db_junction

def get_keyword_by_id(db:Session, source_id:int, keyword_id:int):
    return db.query(models.Keyword).filter(models.Keyword.ID == keyword_id and models.Keyword.SOURCE_ID == source_id).first()

def get_chunks_by_source(db: Session, source_id: int):
    return db.query(models.Chunk).filter(models.Chunk.SOURCE_ID == source_id).all()

def get_keywords_by_source(db: Session, source_id: int):
    return db.query(models.Keyword).filter(models.Keyword.SOURCE_ID == source_id).all()

def get_junctions_by_keyword(db:Session, keyword_id: int, source_id: int):
    return db.query(models.Junction).filter(models.Junction.KEYWORD_ID == keyword_id and models.Junction.SOURCE_ID == source_id).all()

def get_summary_by_keyword(db:Session, keyword_id:int, source_id:int):
    return db.query(models.Summary).filter(models.Summary.KEYWORD_ID == keyword_id and models.Summary.SOURCE_ID == source_id).first()
    
def get_summary_by_source(db:Session, source_id:int):
    return db.query(models.Summary).filter(models.Summary.SOURCE_ID == source_id).all()

def get_chunks_by_keyword(db: Session, keyword_id: int, source_id: int):
    chunk_ids = [c.CHUNK_ID for c in get_junctions_by_keyword(db=db, keyword_id = keyword_id, source_id = source_id)]
    chunks = []
    for i in chunk_ids:
        chunks.append(db.query(models.Chunk).filter(models.Chunk.ID == i and models.Chunk.SOURCE_ID == source_id).first())
    return chunks

def create_junctions_by_source(db:Session, source_id: int):
    chunks = get_chunks_by_source(db=db, source_id = source_id)
    keywords = get_keywords_by_source(db=db, source_id = source_id)
    for keyword in keywords:
        for chunk in chunks:
            if keyword.KEYWORD in chunk.CHUNK_TEXT:
                junction_data = schemas.JunctionCreate(SOURCE_ID = source_id, KEYWORD_ID = keyword.ID, CHUNK_ID = chunk.ID)
                create_junction(db = db, junction = junction_data)
