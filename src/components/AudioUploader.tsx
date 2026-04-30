import React, { useRef, useState } from "react";
import { Upload, X, Music, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AudioUploaderProps {
  label: string;
  type: "reference" | "source";
  onFileSelect: (file: File | null) => void;
  file: File | null;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ label, type, onFileSelect, file }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type.startsWith("audio/")) {
      onFileSelect(selectedFile);
    } else {
      alert("Please upload a valid audio file.");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile) handleFile(selectedFile);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end px-1">
        <span className="mono-label">{label}</span>
        {file && (
          <button 
            onClick={() => onFileSelect(null)}
            className="text-[10px] text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1"
          >
            <X size={10} /> Clear
          </button>
        )}
      </div>
      
      <div
        id={`uploader-${type}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`
          relative h-32 hardware-widget border-dashed border-2 cursor-pointer
          flex flex-col items-center justify-center transition-all duration-300
          ${isDragging ? "border-[#F27D26] bg-[#222]" : "border-[#333] hover:border-[#444]"}
          ${file ? "border-solid border-[#00FF00]" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file-info"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-2 p-4 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#00FF00]/10 flex items-center justify-center text-[#00FF00]">
                {type === "reference" ? <Music size={20} /> : <Mic size={20} />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                <span className="mono-label text-[8px]">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 text-[#555]"
            >
              <Upload size={24} />
              <span className="text-xs uppercase tracking-[0.2em]">Drop Audio Here</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
