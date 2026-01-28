from pydantic import BaseModel, ConfigDict
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
    model_config = ConfigDict(from_attributes=True)

class KeywordwithIDs(Keyword):
    CHUNK_IDS: list[int] = []

class SourceBase(BaseModel):
    SOURCE_NAME: str

class SourceCreate(SourceBase):
    pass

class Source(SourceBase):
    ID: int
    ETL_CREATED_TIME: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ChunkBase(BaseModel):
    CHUNK_TEXT: str

class ChunkCreate(ChunkBase):
    pass

class Chunk(ChunkBase):
    ID: int
    SOURCE_ID: int
    ETL_CREATED_TIME: datetime

    model_config = ConfigDict(from_attributes=True)

class JunctionBase(BaseModel):
    SOURCE_ID: int
    CHUNK_ID: int
    KEYWORD_ID: int

class JunctionCreate(JunctionBase):
    pass

class Junction(JunctionBase):
    ID: int
    ETL_CREATED_TIME: datetime

    model_config = ConfigDict(from_attributes=True)
