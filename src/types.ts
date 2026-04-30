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
  consent_check: {
    passed: boolean;
    message: string;
  };
  input_validation: {
    reference_audio: {
      status: "ok" | "failed";
      notes: string;
    };
    source_audio: {
      status: "ok" | "failed";
      notes: string;
    };
  };
  analysis: {
    reference_style_summary: string[];
    source_transcript: string;
    source_language: string;
  };
  transformation_plan: {
    pipeline: string[];
    recommended_models: string[];
    post_processing: string[];
  };
  safety: {
    risk_level: "low" | "medium" | "high";
    blocked_reason: string;
  };
  final_response: string;
  transformed_audio_base64?: string;
}
