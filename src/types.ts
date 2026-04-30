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
  consent_verified: boolean;
  reference_analysis: {
    pitch_range: string;
    intonation: string;
    pace: string;
    energy: string;
    noise_profile: string;
  };
  source_transcript: string;
  processing_actions: string[];
  blocked_reason: string;
  transformed_audio_base64?: string;
}
