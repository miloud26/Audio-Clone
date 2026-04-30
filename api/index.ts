import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization of Gemini
let genAIInstance: any = null;
function getGenAI() {
  if (!genAIInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    genAIInstance = new GoogleGenAI({ apiKey: key });
  }
  return genAIInstance;
}

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
export const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Audio Clone API", timestamp: new Date().toISOString() });
});

apiRouter.post("/transform", async (req, res) => {
  console.log("Processing transformation request...");
  try {
    const { referenceBase64, sourceBase64, consent, mode } = req.body;

    if (!consent) {
      return res.status(400).json({
        error: "Consent required",
        message: "User did not explicitly confirm consent."
      });
    }

    if (!mode) {
      return res.status(400).json({
        error: "Mode required",
        message: "Please select a transformation mode (Copy Voice Style or Keep Original Voice)."
      });
    }

    if (!referenceBase64 || !sourceBase64) {
      return res.status(400).json({
        error: "Missing data",
        message: "Both reference and source audio streams are required."
      });
    }

    const ai = getGenAI();

    const prompt = `
      SYSTEM UPDATE — CONSENT-BASED VOICE PRESERVATION

      You are an audio processing system for user-owned or explicitly consented audio only.

      Primary objective:
      - Preserve the original speaker identity of the target audio.
      - Improve clarity, noise reduction, and intelligibility.
      - Maintain the target audio’s own voice identity; do not replace it with any other speaker identity.

      Strict constraints:
      - Do not imitate, clone, or reproduce the identity of any real person other than the verified owner of the uploaded audio.
      - Do not infer or transfer voice identity from a reference file unless ownership/consent is explicitly verified.
      - Do not alter the target speaker into a different person’s voice.
      - Do not claim the output is someone else’s voice.
      - If consent or ownership is unclear, block the transformation and keep the original voice unchanged.

      Pipeline Requirements:
      1) Validate file format, duration, and quality.
      2) Verify ownership/consent metadata.
      3) Extract transcript from the target audio.
      4) Enhance the target audio while preserving its speaker identity.
      5) Reject any request that attempts identity transfer.

      Output ONLY valid JSON.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [
          { text: prompt },
          { text: `Target Mode: ${mode}` },
          { inlineData: { mimeType: "audio/mpeg", data: referenceBase64 } },
          { inlineData: { mimeType: "audio/mpeg", data: sourceBase64 } }
        ]}
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ["ok", "blocked"] },
            processing_mode: { type: Type.STRING, enum: ["preserve_original_voice", "enhance_only", "blocked"] },
            validation: {
              type: Type.OBJECT,
              properties: {
                ownership_verified: { type: Type.BOOLEAN },
                file_quality_ok: { type: Type.BOOLEAN },
                format_supported: { type: Type.BOOLEAN }
              },
              required: ["ownership_verified", "file_quality_ok", "format_supported"]
            },
            analysis: {
              type: Type.OBJECT,
              properties: {
                original_identity_metrics: { type: Type.ARRAY, items: { type: Type.STRING } },
                target_transcript: { type: Type.STRING }
              },
              required: ["original_identity_metrics", "target_transcript"]
            },
            enhancement_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            final_export_ready: { type: Type.BOOLEAN },
            transformed_audio_base64: { type: Type.STRING }
          },
          required: [
            "status",
            "processing_mode",
            "validation",
            "analysis",
            "enhancement_actions",
            "warnings",
            "final_export_ready"
          ]
        }
      }
    });

    const responseText = result.text || "{}";
    const parsed = JSON.parse(responseText);
    
    // Simulations in sandbox: Return source as transformed if status is ok
    if (parsed.status === "ok") {
      parsed.transformed_audio_base64 = sourceBase64;
    }
    
    res.json(parsed);

  } catch (error: any) {
    console.error("Gemini processing error:", error.message);
    res.status(500).json({
      error: "Processing failed",
      message: error.message || "An error occurred during audio orchestration."
    });
  }
});

// Robust mounting for both local dev and Vercel environments
app.use("/api", apiRouter);
app.use("/", apiRouter); 
export default app;
