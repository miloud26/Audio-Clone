export enum TransformationMode {
  PRESERVE_ORIGINAL_VOICE = "preserve_original_voice",
  ENHANCE_ONLY = "enhance_only",
  BLOCKED = "blocked"
}

export enum OperationStatus {
  IDLE = "idle",
  VALIDATING = "validating",
  TRANSCRIBING = "transcribing",
  ANALYZING = "analyzing",
  PLANNING = "planning",
  COMPLETE = "complete",
  FAILED = "failed"
}

export interface AudioTransformationResult {
  status: "ok" | "blocked";
  processing_mode: TransformationMode;
  validation: {
    ownership_verified: boolean;
    file_quality_ok: boolean;
    format_supported: boolean;
  };
  analysis: {
    original_identity_metrics: string[];
    target_transcript: string;
  };
  enhancement_actions: string[];
  warnings: string[];
  final_export_ready: boolean;
  transformed_audio_base64?: string;
}
