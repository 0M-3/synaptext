from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy import Session
from fastapi.middleware.cors import CORSMiddleware

from . import crud, models, schemas, process
from .database import engine, get_db
import shutil
import os

# Automatically create tables on application startup.
models.Base.metadata.create_all(bind=engine)

app = FastAPI (
    title = "SynapText Backend API",
    description = "SynaText Backend API",
    version = "0.0.1",
)

origins = [
    "http://localhost:3000"
]




# Automatically create tables on application startup.
models.Base.metadata.create_all(bind=engine)

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
        
        chunks = process.extract_chunks(temp_file_path)
        
        for chunk in chunks:
            chunk_data = schemas.ChunkCreate(CHUNK_TEXT=chunk.page_content)
            crud.create_chunk(db=db, chunk=chunk_data, source_id=source.ID)

    finally:
        # Clean up the temporary file
        os.remove(temp_file_path)

    return {"filename": file.filename, "source_id": source.ID, "status": "success"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the SynapText Backend API"}

