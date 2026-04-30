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
    let errorMessage = `Server error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Fallback if not JSON
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}
