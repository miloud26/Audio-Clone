export enum TransformationMode {
  COPY_VOICE_STYLE = "copy_voice_style",
  KEEP_ORIGINAL_VOICE = "keep_original_voice"
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
  mode: TransformationMode;
  validation: {
    ownership_verified: boolean;
    file_quality_ok: boolean;
    format_supported: boolean;
  };
  analysis: {
    reference_features: string[];
    target_transcript: string;
  };
  action_taken: string[];
  warnings: string[];
  output_instructions: string;
  transformed_audio_base64?: string;
}
