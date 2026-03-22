import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  group: string;
  size: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  weight: number;
  label?: string;
  color?: string;
  dashArray?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
