import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Zap } from "lucide-react";
import { OperationStatus } from "../types";

interface ProcessingOverlayProps {
  status: OperationStatus;
}

const statusMessages = {
  [OperationStatus.VALIDATING]: "Calibrating signal chains...",
  [OperationStatus.TRANSCRIBING]: "Decoding linguistic patterns...",
  [OperationStatus.ANALYZING]: "Harmonizing spectral data...",
  [OperationStatus.PLANNING]: "Generating transformation orchestration...",
  [OperationStatus.COMPLETE]: "Sequence complete.",
  [OperationStatus.FAILED]: "System fault detected.",
  [OperationStatus.IDLE]: ""
};

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ status }) => {
  if (status === OperationStatus.IDLE) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <div className="hardware-widget w-full max-w-sm p-8 flex flex-col items-center gap-6 text-center border-[#F27D26]/30">
          <div className="relative">
             <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-[#F27D26]"
             >
                <Loader2 size={48} />
             </motion.div>
             <div className="absolute inset-0 flex items-center justify-center text-[#F27D26]">
                <Zap size={16} />
             </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="mono-label text-[#F27D26] animate-pulse">Processing Sequence</span>
            <h3 className="text-lg font-bold tracking-tight">{statusMessages[status]}</h3>
          </div>

          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden border border-zinc-800">
             <motion.div 
                className="h-full bg-[#F27D26]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, repeat: Infinity }}
             />
          </div>
          
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest italic">
            Do not disconnect local signal
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
