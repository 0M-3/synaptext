
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import spacy
import networkx as nx

# This script serves as the backend specification for SynapText.
# In a local environment, you would run this with: uvicorn main:app --reload

app = FastAPI(title="SynapText Document Intelligence Backend")

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy for linguistic filtering
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # If not present, the user would need: python -m spacy download en_core_web_sm
    nlp = None

@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        # 1. Ingest PDF via PyMuPDF
        contents = await file.read()
        doc = fitz.open(stream=contents, filetype="pdf")
        
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        
        # 2. Semantic Chunking (Simplified logic for backend demo)
        # In practice, we'd use LangChain's RecursiveCharacterTextSplitter here
        chunks = full_text.split("\n\n") 
        chunks = [c.strip() for c in chunks if len(c.strip()) > 50]
        
        # 3. Linguistic Filtering & Node Identification (spaCy)
        nodes = []
        if nlp:
            for i, chunk in enumerate(chunks):
                doc_spacy = nlp(chunk)
                # Filter for proper nouns and significant entities
                entities = [ent.text for ent in doc_spacy.ents if ent.label_ in ["ORG", "PERSON", "GPE", "PRODUCT"]]
                nodes.append({"chunk_id": i, "text": chunk, "entities": list(set(entities))})
        
        # 4. Graph Centarity via NetworkX
        G = nx.Graph()
        for node in nodes:
            G.add_node(f"chunk_{node['chunk_id']}", type="CHUNK")
            for ent in node["entities"]:
                G.add_node(ent, type="TOPIC")
                G.add_edge(f"chunk_{node['chunk_id']}", ent)
        
        # Calculate centrality
        centrality = nx.degree_centrality(G)
        
        return {
            "filename": file.filename,
            "chunks": nodes,
            "graph": {
                "nodes": [{"id": n, "type": G.nodes[n]["type"], "centrality": centrality.get(n, 0)} for n in G.nodes],
                "links": [{"source": u, "target": v} for u, v in G.edges]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
