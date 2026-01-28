import { Chunk, Keyword } from "../types";

const API_URL = "http://localhost:8000";

export interface BackendResponse {
  filename: string;
  source_id: number;
  status: string;
  chunks: Chunk[];
  keywords: Keyword[];
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

  return {
    ...uploadData,
    chunks: graphData.chunks,
    keywords: graphData.keywords,
  };
}
