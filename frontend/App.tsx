
import React, { useState, useCallback } from 'react';
import { DocumentState, GraphNode, Chunk, GraphData } from './types';
import { uploadPdf } from './services/apiService';
import { buildGraph } from './services/graphUtils';
import GraphView from './components/GraphView';
import ReaderPanel from './components/ReaderPanel';

const App: React.FC = () => {
  const [docState, setDocState] = useState<DocumentState | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSelectedNodeId(null);
    setProcessStep('Uploading and processing file...');

    try {
      const backendResponse = await uploadPdf(file);
      
      setProcessStep('Building graph...');
      const graph = buildGraph(backendResponse.chunks, backendResponse.keywords);

      setDocState({
        id: backendResponse.source_id.toString(),
        name: backendResponse.filename,
        content: '', // Not needed anymore
        chunks: backendResponse.chunks,
        graph,
        isProcessing: false
      });
      setProcessStep('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during processing.');
      setProcessStep('');
    } finally {
      setIsProcessing(false);
    }
  };

  const onNodeClick = useCallback((node: GraphNode) => {
    setSelectedNodeId(node.id);
    if (node.id.startsWith('c-')) {
        const element = document.getElementById(`chunk-${node.id}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 text-white flex flex-col shrink-0 shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">S</div>
            <h1 className="text-xl font-bold tracking-tight">SynapText</h1>
          </div>
          <p className="text-slate-400 text-xs">Bipartite Document Intelligence</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-3">Upload PDF Source</label>
            <div className="relative group">
              <input 
                type="file" 
                accept=".pdf,.txt,.md" 
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
              />
              <div className="border-2 border-dashed border-slate-700 group-hover:border-indigo-500 rounded-xl p-6 text-center transition-colors">
                <svg className="w-8 h-8 mx-auto mb-2 text-slate-500 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium">Select PDF or Text</p>
                <p className="text-[10px] text-slate-500 mt-1">PyMuPDF Ingestion Logic Ready</p>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="mb-8 p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-lg animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-indigo-300 uppercase">Pipeline Active</span>
              </div>
              <p className="text-[11px] text-slate-300 italic">{processStep}</p>
            </div>
          )}

          {docState && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-3">Analysis Result</label>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded">
                       <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold truncate">{docState.name}</p>
                      <p className="text-[10px] text-slate-400">PDF Document Intelligence</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-slate-900/50 p-2 rounded text-center">
                      <p className="text-indigo-400 font-bold text-sm">{docState.chunks.length}</p>
                      <p className="text-[8px] text-slate-500 uppercase">Chunks</p>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded text-center">
                      <p className="text-emerald-400 font-bold text-sm">{docState.graph.nodes.filter(n => n.type === 'TOPIC').length}</p>
                      <p className="text-[8px] text-slate-500 uppercase">Resolved</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Architecture: FastAPI Backend (Mocked in Preview) <br/>
            Ingestion: PyMuPDF + spaCy <br/>
            Logic: NetworkX Centrality + Gemini Entity Resolution
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Bipartite Appendix Canvas</h2>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">MODE: EXPRESSIVE APPENDIX</span>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 bg-white relative">
            {docState ? (
              <GraphView 
                data={docState.graph} 
                onNodeClick={onNodeClick}
                selectedNodeId={selectedNodeId}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-slate-100 animate-pulse">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-400">Initialize SynapText Pipeline</h3>
                <p className="text-sm max-w-xs text-center mt-2 text-slate-400">Upload a PDF to begin semantic analysis, entity resolution, and bipartite mapping.</p>
              </div>
            )}
          </div>

          <div className="w-[480px] shrink-0 border-l border-slate-200 shadow-2xl">
            <ReaderPanel 
              chunks={docState?.chunks || []} 
              graph={docState?.graph || { nodes: [], links: [] }}
              selectedNodeId={selectedNodeId}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
