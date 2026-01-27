from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy import Session
from fastapi.middleware.cors import CORSMiddleware

from . import crud, models, schemas
from .database import engine, get_db

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

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_header = ["*"],
)

@app.post("/sqlalchemy")
def test_posts(db: Session = Depends(get_db)):
    return {"status": "success"}



# @app.post("/process-doc")
# async def process_doc(file: UploadFile = File(...)):
#     doc_bytes = await file.read()
#     return crud.create_chunks(db = db, file = doc_bytes)

#TODO: Add the get, post and put requests here
