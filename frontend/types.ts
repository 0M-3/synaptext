import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";

export enum NodeType {
  CHUNK = "CHUNK",
  TOPIC = "TOPIC",
}

// Fix: Inherit from SimulationNodeDatum using imported type to ensure x, y, and other simulation properties are available
export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: NodeType;
  weight: number;
  content?: string;
  chunkIndex?: number;
}

// Fix: Inherit from SimulationLinkDatum using imported type for the GraphLink interface
export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
}

export interface Chunk {
  id: string;
  text: string;
  index: number;
}

export interface Entity {
  name: string;
  description: string;
  type: string;
  chunkIds: string[];
}

export interface Keyword {
  keyword: string;
  instances: number;
  id: string;
  source_id: string;
  chunkids: string[];
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface DocumentState {
  id: string;
  name: string;
  content: string;
  chunks: Chunk[];
  graph: GraphData;
  isProcessing: boolean;
}
