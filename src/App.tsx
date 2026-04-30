import React, { useState, useEffect } from "react";
import { AudioUploader } from "./components/AudioUploader";
import { ConsentToggle } from "./components/ConsentToggle";
import { ProcessingOverlay } from "./components/ProcessingOverlay";
import { ResultView } from "./components/ResultView";
import { OperationStatus, AudioTransformationResult, TransformationMode } from "./types";
import { processAudioTransformation } from "./lib/gemini";

export default function App() {
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<OperationStatus>(OperationStatus.IDLE);
  const [result, setResult] = useState<AudioTransformationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleProcess = async () => {
    if (!referenceFile || !sourceFile) return;
    if (!consent) {
       setErrorMessage("Ownership/Consent verification required.");
       return;
    }

    setErrorMessage(null);
    setStatus(OperationStatus.VALIDATING);

    try {
      const refBase64 = await fileToBase64(referenceFile);
      
      setTimeout(() => setStatus(OperationStatus.TRANSCRIBING), 1500);
      
      const srcBase64 = await fileToBase64(sourceFile);
      
      setTimeout(() => setStatus(OperationStatus.ANALYZING), 3000);
      
      const aiResult = await processAudioTransformation(refBase64, srcBase64, consent);
      
      setStatus(OperationStatus.PLANNING);
      
      setTimeout(() => {
        setResult(aiResult);
        setStatus(OperationStatus.IDLE);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setStatus(OperationStatus.IDLE);
      setErrorMessage(err.message || "System Failure: Secure processing aborted.");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto flex flex-col gap-8 pb-20">
      <ProcessingOverlay status={status} />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <div className="status-led ready" />
             <span className="mono-label">System Active</span>
           </div>
           <h1 className="text-4xl font-black uppercase tracking-tighter italic">Audio Clone</h1>
           <p className="text-zinc-500 text-sm font-medium">Consent-Based Vocal Orchestration Engine</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1">
           <span className="mono-label text-[8px] text-zinc-400">Firmware v3.1.0-Flash</span>
           <span className="mono-label text-[8px] text-zinc-400">Signal Path: AES/EBU Virtual</span>
        </div>
      </header>

      {!result ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col gap-6">
            <AudioUploader 
              label="Signal 01: Reference (Style)" 
              type="reference"
              file={referenceFile}
              onFileSelect={setReferenceFile}
            />
            <AudioUploader 
              label="Signal 02: Source (Content)" 
              type="source"
              file={sourceFile}
              onFileSelect={setSourceFile}
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <ConsentToggle checked={consent} onChange={setConsent} />
              
              <div className="hardware-widget p-4 border-[#222]">
                <div className="mono-label text-[10px] mb-2 text-[#00FF00] uppercase tracking-widest">Protocol: Secure Enhancement</div>
                <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                  Systems will analyze acoustic parameters from the reference while strictly preserving the speaker identity of the source material. Identity cloning is blocked.
                </p>
              </div>
            </div>
            
            <div className="hardware-widget flex-1 p-6 flex flex-col justify-between gap-8 border-[#222]">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                   <span className="mono-label text-[9px]">Parameters</span>
                   <span className="mono-label text-[9px]">Auto</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-400">
                   <span>Safety Protocol</span>
                   <span className="text-[#00FF00]">Strict</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-400">
                   <span>Spectral Analysis</span>
                   <span className="text-[#00FF00]">High</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-400">
                   <span>Phonetic Tracking</span>
                   <span className="text-[#00FF00]">Active</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {errorMessage && (
                  <div className="text-red-500 text-[10px] uppercase font-bold text-center tracking-widest animate-pulse">
                    !! {errorMessage} !!
                  </div>
                )}
                <button
                  disabled={!referenceFile || !sourceFile || !consent || status !== OperationStatus.IDLE}
                  onClick={handleProcess}
                  className={`
                    w-full py-4 rounded-xl font-bold uppercase tracking-[0.2em] transition-all
                    ${(!referenceFile || !sourceFile || !consent) 
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50" 
                      : "bg-[#F27D26] text-white hover:bg-[#ff8c3a] shadow-xl shadow-orange-950/20 active:scale-95"}
                  `}
                >
                  Initiate Sequence
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ResultView result={result} />
      )}

      {result && (
        <div className="flex justify-center mt-4">
          <button 
            onClick={() => {
              setResult(null);
              setReferenceFile(null);
              setSourceFile(null);
            }}
            className="mono-label hover:text-white transition-colors py-2 px-4 border border-zinc-800 rounded-lg"
          >
            Reset Signal Chain
          </button>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 w-full p-4 bg-zinc-100/5 backdrop-blur-md border-t border-zinc-200/10 flex justify-between items-center">
         <div className="flex items-center gap-4">
           <div className="flex items-center gap-1">
             <div className="w-1 h-1 rounded-full bg-[#00FF00]" />
             <span className="mono-label text-[7px]">Buffer: 1024ms</span>
           </div>
           <div className="flex items-center gap-1">
             <div className="w-1 h-1 rounded-full bg-[#00FF00]" />
             <span className="mono-label text-[7px]">Sample Rate: 48kHz</span>
           </div>
         </div>
         <span className="mono-label text-[7px] italic text-zinc-400">Authorized Personnel Only</span>
      </footer>
    </div>
  );
}
