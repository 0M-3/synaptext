from pydantic import BaseModel
from datetime import datetime
from typing import List

class KeywordBase(BaseModel):
    KEYWORD: str
    INSTANCES: int

class KeywordCreate(KeywordBase):
    pass

class Keyword(KeywordBase):
    ID: int
    SOURCE_ID: int
    ETL_CREATED_TIME: datetime

    class Config:
        orm_mode = True

class SourceBase(BaseModel):
    SOURCE_NAME: str

class SourceCreate(SourceBase):
    pass

class Source(SourceBase):
    ID: int
    ETL_CREATED_TIME: datetime
    
    class Config:
        orm_mode = True

class ChunkBase(BaseModel):
    CHUNK_TEXT: str

class ChunkCreate(ChunkBase):
    pass

class Chunk(ChunkBase):
    ID: int
    SOURCE_ID: int
    ETL_CREATED_TIME: datetime

    class Config:
        orm_mode = True