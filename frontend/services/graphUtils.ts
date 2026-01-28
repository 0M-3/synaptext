import {
  Chunk,
  Entity,
  Keyword,
  GraphData,
  NodeType,
  GraphNode,
  GraphLink,
} from "../types";

export function buildGraph(
  chunks: Chunk[],
  entities: Entity[],
  keywords: Keyword[],
): GraphData {
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
    const topicId = `topic-${keyword.KEYWORD.toLowerCase().replace(/\s+/g, "-")}`;

    // Calculate importance based on number of chunks it connects to (Degree Centrality)
    const weight = 5 + keyword.INSTANCES * 2;

    nodes.push({
      id: topicId,
      label: keyword.KEYWORD,
      type: NodeType.TOPIC,
      content: keyword.KEYWORD,
      weight: weight,
    });

    // Create links
    entity.chunkIds.forEach((chunkId) => {
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
