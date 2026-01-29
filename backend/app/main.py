from .models import Base  # Add this import
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from . import crud, models, schemas, process
from .database import engine, get_db
import shutil
import os

Base.metadata.create_all(bind=engine)

app = FastAPI (
    title = "SynapText Backend API",
    description = "SynaText Backend API",
    version = "0.0.1",
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-pdf/")
async def create_upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Create a new source for the uploaded file
    source = crud.create_source(db=db, source=schemas.SourceCreate(SOURCE_NAME=file.filename))

    # Save the uploaded file to a temporary location
    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, file.filename)
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Process the PDF to extract chunks
        chunks = process.extract_nlp_chunks(temp_file_path)

        for chunk in chunks:
            chunk_data = schemas.ChunkCreate(CHUNK_TEXT=chunk.page_content)
            crud.create_chunk(db=db, chunk=chunk_data, source_id=source.ID)

        # Process the PDF to extract significant terms
        propn_counts, phrase_counts = process.extract_significant_terms(temp_file_path)

        # Create keyword entries for proper nouns
        for term, count in propn_counts:
            keyword_data = schemas.KeywordCreate(KEYWORD=term, INSTANCES=count)
            crud.create_keyword(db=db, keyword=keyword_data, source_id=source.ID)

        # Create keyword entries for noun phrases
        for term, count in phrase_counts:
            keyword_data = schemas.KeywordCreate(KEYWORD=term, INSTANCES=count)
            crud.create_keyword(db=db, keyword=keyword_data, source_id=source.ID)

        crud.create_junctions_by_source(db = db, source_id = source.ID)

    finally:
        # Clean up the temporary file
        os.remove(temp_file_path)

    return {"filename": file.filename, "source_id": source.ID, "status": "success"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the SynapText Backend API"}

@app.get("/sources/{source_id}/chunks/", response_model=list[schemas.Chunk])
def read_chunks_by_source(source_id: int, db: Session = Depends(get_db)):
    chunks = crud.get_chunks_by_source(db=db, source_id=source_id)
    return chunks

@app.get("/sources/{source_id}/keywords/", response_model=list[schemas.Keyword])
def read_keywords_by_source(source_id: int, db: Session = Depends(get_db)):
    keywords = crud.get_keywords_by_source(db=db, source_id=source_id)
    return keywords

@app.get("/sources/{source_id}/graph/")
def get_graph_data(source_id: int, db: Session = Depends(get_db)):
    # Get chunks and keywords from the database
    db_chunks = crud.get_chunks_by_source(db=db, source_id=source_id)
    db_keywords = crud.get_keywords_by_source(db=db, source_id=source_id)

    # Convert the database objects to Pydantic schemas
    chunks = [schemas.Chunk.from_orm(chunk) for chunk in db_chunks]
    # keywords = [schemas.Keyword.from_orm(keyword) for keyword in db_keywords]
    keywords = []
    for kw in db_keywords:
        # 1. Convert DB object to Pydantic
        kw_schema = schemas.KeywordwithIDs.from_orm(kw)
        kw_junctions = crud.get_junctions_by_keyword(db=db, source_id=source_id, keyword_id = kw.ID)
        # 2. Extract IDs from the relationship (assuming 'chunks' relationship exists on Keyword model)
        # If your DB model has a relationship: kw.chunks
        kw_schema.CHUNK_IDS = [c.CHUNK_ID for c in kw_junctions] 
        
        keywords.append(kw_schema)

    #TODO: Insert ChunkIDs into the keywords returned.
    # Return the graph data in a format that the frontend can use
    return {"chunks": chunks, "keywords": keywords}


