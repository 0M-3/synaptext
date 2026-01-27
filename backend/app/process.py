import re
import fitz
import spacy
from collections import Counter

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

def extract_chunks(pdf_path):
    loader = PyPDFLoader(pdf_path)
    doc = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=0)
    chunks=[]
    for docer in doc:
        texts = text_splitter.split_text(docer.page_content)
        chunks.extend([
            Document(page_content=text, metadata=docer.metadata) for text in texts
        ])
    return chunks

def is_valid_phrase(phrase_text):
    # 1. Remove phrases that are just figure references or coordinates like (a), (b), (s)
    if re.search(r'\([a-z]\)', phrase_text.lower()):
        return False
        
    # 2. Remove phrases containing math symbols or specific noise characters
    if any(char in phrase_text for char in ['×', '+', '=', '>', '<', '±']):
        return False

    # 3. Remove phrases that are too short or mostly digits
    # (Checking if the phrase contains at least 3 alphabetic characters)
    letters_only = re.sub(r'[^a-zA-Z]', '', phrase_text)
    if len(letters_only) < 3:
        return False
        
    return True
def extract_significant_terms(pdf_path):
    # 1. Load spaCy model
    nlp = spacy.load("en_core_web_md")
    # 2. Add custom stop words (document-specific noise)
    custom_noise = {"page", "section", "author", "figure", "table", "http", "proceedings", "introduction"}
    for word in custom_noise:
        nlp.vocab[word].is_stop = True

    # 3. Extract text from PDF
    print(f"Reading {pdf_path}...")
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()

    # 4. Process text with spaCy
    print("Processing linguistics (this may take a moment)...")
    doc = nlp(text)

    # 5. Extract Significant Elements
    # A: Proper Nouns (Einstein, London, NASA)
    propn = [t.text.strip() for t in doc if t.pos_ == "PROPN" and not t.is_stop and len(t.text) > 2]
    
    # B: Noun Phrases (Carbon Sequestration, Artificial Intelligence)
    # We filter out phrases that are purely stop words or too short
    phrases = [chunk.text.replace("\n", " ").strip().lower()
               for chunk in doc.noun_chunks
               if is_valid_phrase(chunk.text) and not nlp.vocab[chunk.root.text].is_stop and len(chunk.text) > 3]

    # 6. Count Frequencies
    propn_counts = Counter(propn).most_common(50)
    phrase_counts = Counter(phrases).most_common(50)

    return [propn_counts, phrase_counts]


    print("Success! Analysis saved to db")

if __name__ == "__main__":
    extract_significant_terms("bioengineering-10-01348.pdf")
