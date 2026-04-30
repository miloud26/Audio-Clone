import React, { useState } from "react";
import { AudioTransformationResult } from "../types";
import { Clipboard, Check, Activity, Shield, FileText, Settings } from "lucide-react";

interface ResultViewProps {
  result: AudioTransformationResult;
}

export const ResultView: React.FC<ResultViewProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"summary" | "json">("summary");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold uppercase tracking-tighter italic">Transformation Output</h2>
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button 
            onClick={() => setViewMode("summary")}
            className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${viewMode === "summary" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Summary
          </button>
          <button 
            onClick={() => setViewMode("json")}
            className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${viewMode === "json" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            JSON
          </button>
        </div>
      </div>

      <div className="hardware-widget p-6 min-h-[400px] overflow-auto">
        {viewMode === "json" ? (
          <div className="relative">
            <button 
              onClick={copyToClipboard}
              className="absolute top-0 right-0 p-2 hover:bg-zinc-800 rounded-md text-zinc-500 transition-colors"
            >
              {copied ? <Check size={16} className="text-[#00FF00]" /> : <Clipboard size={16} />}
            </button>
            <pre className="font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Summary Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#00FF00]">
                <Activity size={18} />
                <h3 className="mono-label text-sm">Vocal Style Analysis</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.analysis.reference_style_summary.map((attr, i) => (
                  <li key={i} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF00]" />
                    <span className="text-xs text-zinc-300 leading-tight">{attr}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400">
                <FileText size={18} />
                <h3 className="mono-label text-sm">Source Transcript</h3>
              </div>
              <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 italic text-sm text-zinc-300 leading-relaxed">
                "{result.analysis.source_transcript}"
              </div>
              <div className="flex justify-end">
                <span className="mono-label text-[10px]">Language: {result.analysis.source_language}</span>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#F27D26]">
                <Settings size={18} />
                <h3 className="mono-label text-sm">Orchestration Pipeline</h3>
              </div>
              <div className="flex flex-col gap-2">
                {result.transformation_plan.pipeline.map((step, i) => (
                  <div key={i} className="flex items-center gap-4 text-xs">
                    <span className="mono-label w-8 text-zinc-600">{(i + 1).toString().padStart(2, '0')}</span>
                    <span className="text-zinc-300">{step}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-4 pt-6 border-t border-zinc-800 flex flex-col items-center text-center gap-4">
              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full border
                ${result.safety.risk_level === 'low' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'}
              `}>
                <Shield size={14} />
                <span className="mono-label text-[9px]">Safety Status: {result.safety.risk_level} Risk</span>
              </div>
              <p className="text-zinc-400 text-sm max-w-md italic">
                {result.final_response}
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
