
import React from 'react';
import { Chunk, GraphData, NodeType } from '../types';

interface ReaderPanelProps {
  chunks: Chunk[];
  graph: GraphData;
  selectedNodeId: string | null;
}

const ReaderPanel: React.FC<ReaderPanelProps> = ({ chunks, graph, selectedNodeId }) => {
  // Determine which chunk IDs to highlight
  const highlightedChunkIds = React.useMemo(() => {
    if (!selectedNodeId) return [];
    
    const node = graph.nodes.find(n => n.id === selectedNodeId);
    if (!node) return [];

    if (node.type === NodeType.CHUNK) {
      return [node.id];
    } else {
      // Topic node: find all connected chunks
      return graph.links
        .filter(l => {
          const targetId = typeof l.target === 'string' ? l.target : l.target.id;
          const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
          return targetId === selectedNodeId || sourceId === selectedNodeId;
        })
        .map(l => {
          const targetId = typeof l.target === 'string' ? l.target : l.target.id;
          const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
          return targetId === selectedNodeId ? sourceId : targetId;
        });
    }
  }, [selectedNodeId, graph]);

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Synchronized Reader</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chunks.length === 0 ? (
          <div className="text-center text-slate-400 mt-20">
            <p className="italic">No document ingested yet.</p>
          </div>
        ) : (
          chunks.map((chunk) => {
            const isHighlighted = highlightedChunkIds.includes(chunk.id);
            return (
              <div 
                key={chunk.id} 
                id={`chunk-${chunk.id}`}
                className={`transition-all duration-500 rounded-lg p-4 ${
                  isHighlighted 
                    ? 'bg-yellow-50 ring-2 ring-yellow-200 shadow-md transform scale-[1.02]' 
                    : 'bg-white border border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                    Ref: {chunk.id.slice(0, 6)}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                  {chunk.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReaderPanel;
