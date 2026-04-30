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
      System Update: You are a High-Fidelity Vocal Identity Reconstruction Engine.
      
      Task: 
      Perform a "Deep Identity Transfer" from the Reference Audio to the Target Audio.
      
      Parameters:
      - MODE: ${mode}
      - Reference Audio: The source of "Vocal Identity" (Timbre, Resonance, Harmonic Profile, and unique Prosody).
      - Target Audio: The source of "Linguistic Content" (Semantics and Verbal Structure).
      
      Operational Directives:
      1. Identity Extraction: Map the unique vocal fingerprint of the Reference (how the vocal folds vibrate, oral cavity resonance).
      2. Prosody Alignment: Analyze the cadence, stress patterns, and emotional weight of the Reference.
      3. Synthesis Logic: Calculate the precise delta needed to reshape the Target's vocal tract response to match the Reference's Identity while keeping the Target's words.
      
      Rules for "copy_voice_style":
      - Total Identity Takeover: The output must aim to sound like the person in the Reference is saying the words from the Target.
      - Extract: [Timbre/Voice Color, Fundamental Frequency Range, Formant Shifting, Breathiness, Nasality].
      - Refuse: Public figure impersonation without authorization.
      
      Output ONLY valid JSON.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [
          { text: prompt },
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
            mode: { type: Type.STRING },
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
                reference_features: { type: Type.ARRAY, items: { type: Type.STRING } },
                target_transcript: { type: Type.STRING }
              },
              required: ["reference_features", "target_transcript"]
            },
            action_taken: { type: Type.ARRAY, items: { type: Type.STRING } },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            output_instructions: { type: Type.STRING },
            transformed_audio_base64: { type: Type.STRING }
          },
          required: [
            "status",
            "mode",
            "validation",
            "analysis",
            "action_taken",
            "warnings",
            "output_instructions"
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
