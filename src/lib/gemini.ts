import { AudioTransformationResult } from "../types";

export async function processAudioTransformation(
  referenceBase64: string,
  sourceBase64: string,
  consent: boolean
): Promise<AudioTransformationResult> {
  const response = await fetch("/api/transform", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      referenceBase64,
      sourceBase64,
      consent
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown server error" }));
    throw new Error(errorData.message || "Failed to process audio transformation.");
  }

  return await response.json();
}
