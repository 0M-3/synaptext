import {
  Chunk,
  Keyword,
  GraphData,
  NodeType,
  GraphNode,
  GraphLink,
} from "../types";

export function buildGraph(chunks: Chunk[], keywords: Keyword[]): GraphData {
  if (!Array.isArray(chunks) || !Array.isArray(keywords)) {
    console.error("buildGraph received invalid data:", { chunks, keywords });
    return { nodes: [], links: [] };
  }
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Add Chunk Nodes
  chunks.forEach((chunk) => {
    nodes.push({
      id: chunk.id,
      label: `Chunk ${chunk.index + 1}`,
      type: NodeType.CHUNK,
      content: chunk.text,
      chunkIndex: chunk.index,
      weight: 1,
    });
  });

  // Add Topic Nodes
  keywords.forEach((keyword) => {
    const topicId = `topic-${keyword.keyword.toLowerCase().replace(/\s+/g, "-")}`;

    // Calculate importance based on number of chunks it connects to (Degree Centrality)
    const weight = 5 + keyword.instances * 2;

    nodes.push({
      id: topicId,
      label: keyword.keyword,
      type: NodeType.TOPIC,
      content: keyword.keyword,
      weight: weight,
    });

    // Create links
    keyword.chunkids.forEach((chunkId) => {
      // Ensure chunk actually exists
      if (chunks.some((c) => c.id === chunkId)) {
        links.push({
          source: chunkId,
          target: topicId,
          value: 1,
        });
      }
    });
  });

  return { nodes, links };
}
