#TODO: Add the Loader and Splitter from Langchain here to semantically split the documents
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

def Doc_Splitter(pdf_doc):
    loader = PyPDFLoader(pdf_doc)
    doc = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=0)
    split_docs=[]
    for docer in doc:
        texts = text_splitter.split_text(docer.page_content)
        split_docs.extend([
            Document(page_content=text, metadata=docer.metadata) for text in texts
        ])
    return split_docs
