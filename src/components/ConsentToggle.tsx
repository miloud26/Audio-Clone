import React from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface ConsentToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

export const ConsentToggle: React.FC<ConsentToggleProps> = ({ checked, onChange }) => {
  return (
    <div 
      className={`
        hardware-widget p-4 flex items-center justify-between cursor-pointer
        transition-colors duration-500
        ${checked ? "bg-[#1a2e1a]" : "bg-[#2e1a1a]"}
      `}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center gap-4">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${checked ? "bg-[#00FF00]/20 text-[#00FF00]" : "bg-red-500/20 text-red-500"}
        `}>
          {checked ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold uppercase tracking-wider">Explicit Consent</span>
          <span className="text-[10px] text-zinc-500 max-w-[200px] leading-tight">
            I confirm that I own or have permission to use these voices.
          </span>
        </div>
      </div>

      <div className="relative w-12 h-6 bg-zinc-900 rounded-full p-1 border border-zinc-800">
        <motion.div
          animate={{ x: checked ? 24 : 0 }}
          className={`w-4 h-4 rounded-full ${checked ? "bg-[#00FF00]" : "bg-zinc-700"}`}
        />
      </div>
    </div>
  );
};
