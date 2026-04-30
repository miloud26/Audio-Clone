import React, { useState, useRef } from "react";
import { AudioTransformationResult } from "../types";
import { Clipboard, Check, Activity, Shield, FileText, Settings, Download, Play, Pause } from "lucide-react";

interface ResultViewProps {
  result: AudioTransformationResult;
}

export const ResultView: React.FC<ResultViewProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"summary" | "json">("summary");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result.transformed_audio_base64) return;
    const link = document.createElement("a");
    link.href = `data:audio/mpeg;base64,${result.transformed_audio_base64}`;
    link.download = "transformed_vocal_clone.mp3";
    link.click();
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
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
            {/* Audio Result Hero */}
            {result.transformed_audio_base64 && (
              <section className="bg-gradient-to-br from-zinc-900 to-black p-6 rounded-xl border border-[#00FF00]/20 flex flex-col gap-4 items-center">
                <div className="w-16 h-16 rounded-full bg-[#00FF00]/10 flex items-center justify-center border border-[#00FF00]/30 shadow-[0_0_20px_rgba(0,255,0,0.1)]">
                  <Play size={24} className="text-[#00FF00] fill-[#00FF00]" />
                </div>
                <div className="text-center">
                  <h4 className="mono-label text-xs mb-1 text-white">Transformed Signal Ready</h4>
                  <p className="text-[10px] text-zinc-500">Frequency matched to reference signature</p>
                </div>
                
                <div className="flex gap-3 w-full max-w-xs">
                  <button 
                    onClick={togglePlay}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#00FF00] text-black font-bold uppercase text-[10px] py-3 rounded-lg hover:brightness-110 transition-all active:scale-95"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    {isPlaying ? "Pause Stream" : "Monitor Output"}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="px-4 flex items-center justify-center bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all"
                    title="Download Transformed Audio"
                  >
                    <Download size={16} />
                  </button>
                </div>
                
                <audio 
                  ref={audioRef} 
                  src={`data:audio/mpeg;base64,${result.transformed_audio_base64}`} 
                  className="hidden"
                  onEnded={() => setIsPlaying(false)}
                />
              </section>
            )}

            {/* Summary Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#00FF00]">
                <Activity size={18} />
                <h3 className="mono-label text-sm">Vocal Identity Fingerprint</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.analysis.original_identity_metrics.map((attr, i) => (
                  <li key={i} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF00] shadow-[0_0_5px_#00FF00]" />
                    <span className="text-xs text-zinc-300 leading-tight font-medium">{attr}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400">
                <FileText size={18} />
                <h3 className="mono-label text-sm">Source Phonetic Content</h3>
              </div>
              <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 italic text-sm text-zinc-300 leading-relaxed">
                "{result.analysis.target_transcript}"
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#F27D26]">
                <Settings size={18} />
                <h3 className="mono-label text-sm">Enhancement & Preservation Pipeline</h3>
              </div>
              <div className="flex flex-col gap-2">
                {result.enhancement_actions.map((step, i) => (
                  <div key={i} className="flex items-center gap-4 text-xs">
                    <span className="mono-label w-8 text-zinc-600">{(i + 1).toString().padStart(2, '0')}</span>
                    <span className="text-zinc-300">{step}</span>
                  </div>
                ))}
              </div>
            </section>

            {result.warnings.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-yellow-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  <h3 className="mono-label text-[10px] uppercase font-bold">System Warnings</h3>
                </div>
                <div className="flex flex-col gap-1">
                  {result.warnings.map((warning, i) => (
                    <div key={i} className="text-[10px] text-zinc-500 italic bg-yellow-500/5 p-2 rounded border border-yellow-500/10">
                      • {warning}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-4 pt-6 border-t border-zinc-800 flex flex-col items-center text-center gap-4">
              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full border
                ${result.status === 'ok' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}
              `}>
                <Shield size={14} />
                <span className="mono-label text-[9px]">Identity Preservation: {result.status.toUpperCase()}</span>
              </div>
              <p className="text-zinc-400 text-sm max-w-md italic">
                Mode: {result.processing_mode.replace(/_/g, ' ').toUpperCase()} | Ready for Export: {result.final_export_ready ? "YES" : "NO"}
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
