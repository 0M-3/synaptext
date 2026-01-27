
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink, NodeType } from '../types';

interface GraphViewProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  selectedNodeId?: string | null;
}

const GraphView: React.FC<GraphViewProps> = ({ data, onNodeClick, selectedNodeId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    const simulation = d3.forceSimulation<GraphNode>(data.nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => (d as GraphNode).weight + 10));

    // Links
    const link = g.append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("class", "node")
      .call(d3.drag<any, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any)
      .on("click", (event, d) => onNodeClick(d));

    // Node circles
    node.append("circle")
      .attr("r", d => d.type === NodeType.TOPIC ? d.weight : 6)
      .attr("fill", d => {
        if (d.id === selectedNodeId) return "#ef4444"; // Selected
        return d.type === NodeType.TOPIC ? "#3b82f6" : "#cbd5e1";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Node labels
    node.append("text")
      .attr("dy", d => d.type === NodeType.TOPIC ? -d.weight - 5 : -12)
      .attr("text-anchor", "middle")
      .text(d => d.label)
      .attr("font-size", d => d.type === NodeType.TOPIC ? "12px" : "10px")
      .attr("font-weight", d => d.type === NodeType.TOPIC ? "600" : "400")
      .attr("fill", "#1e293b")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      // Fix: Use non-null assertions for x and y coordinates as they are managed by the simulation
      link
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);

      node
        .attr("transform", d => `translate(${d.x!},${d.y!})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, onNodeClick, selectedNodeId]);

  return (
    <div ref={containerRef} className="w-full h-full force-graph-container relative">
      <svg ref={svgRef} className="w-full h-full block" />
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur p-3 rounded-lg border border-slate-200 text-xs shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span className="font-medium text-slate-700">Topic Node</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-300"></span>
          <span className="font-medium text-slate-700">Source Chunk</span>
        </div>
      </div>
    </div>
  );
};

export default GraphView;
