import { Chunk, Keyword } from "../types";

const API_URL = "http://localhost:8000";

export interface BackendResponse {
  filename: string;
  source_id: number;
  status: string;
  chunks: Chunk[];
  keywords: Keyword[];
}

export interface SummaryResponse {
  keyword: Keyword;
  summary: string;
}

export async function uploadPdf(file: File): Promise<BackendResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const uploadResponse = await fetch(`${API_URL}/upload-pdf/`, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file");
  }

  const uploadData = await uploadResponse.json();
  const sourceId = uploadData.source_id;

  const graphResponse = await fetch(`${API_URL}/sources/${sourceId}/graph/`);

  if (!graphResponse.ok) {
    throw new Error("Failed to fetch graph data from the backend");
  }

  const graphData = await graphResponse.json();

  // Fix: Map API's SCREAMING_CASE to frontend's camelCase and add index to chunks
  return {
    ...uploadData,
    chunks: graphData.chunks.map((chunk: any, index: number) => ({
      id: String(chunk.ID),
      text: chunk.CHUNK_TEXT,
      index: index,
    })),
    keywords: graphData.keywords.map((kw: any) => ({
      keyword: kw.KEYWORD,
      instances: kw.INSTANCES,
      id: String(kw.ID),
      source_id: String(kw.SOURCE_ID),
      chunkids: kw.CHUNK_IDS.map((id: number) => String(id)),
    })),
  };
}

export async function getSummary(sourceId: string, keywordId: string): Promise<SummaryResponse> {
  const response = await fetch(`${API_URL}/sources/${sourceId}/summary/${keywordId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch summary");
  }

  return response.json();
}

export async function downloadSummaries(sourceId: string): Promise<void> {
  const response = await fetch(`${API_URL}/sources/${sourceId}/summary_zip`);

  if (!response.ok) {
    throw new Error("Failed to download summaries");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `source_${sourceId}_summaries.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
