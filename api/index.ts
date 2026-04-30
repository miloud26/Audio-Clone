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
  console.log("Processing audio workflow request...");
  try {
    const { referenceBase64, sourceBase64, consent } = req.body;

    if (!consent) {
      return res.status(400).json({
        error: "Consent required",
        message: "User must verify ownership or explicit permission."
      });
    }

    if (!referenceBase64 || !sourceBase64) {
      return res.status(400).json({
        error: "Missing data",
        message: "Reference and source audio are required."
      });
    }

    const ai = getGenAI();

    const prompt = `
      SYSTEM UPDATE — CONSENT-BASED AUDIO WORKFLOW
      
      You are a professional audio processing system working only on files owned or licensed by the user.
      
      OBJECTIVE:
      1) Analyze Reference (Clip 1) for non-identifying features: pitch range, intonation, pace, energy, noise profile.
      2) Transcribe Source (Clip 2) accurately.
      3) Output Source (Clip 2) with its original voice identity intact, only technically enhanced.
      
      STRICT RULES:
      - NO identity transfer or cloning from Reference.
      - NO impersonation or creating a voice that claims to be someone else.
      - NO change to linguistic content.
      - Use Reference ONLY for general acoustic analysis as requested.
      
      REJECTED:
      - Any request for voice cloning or identity matching other than source enhancement.
      
      RETURN ONLY VALID JSON:
      {
        "status": "ok|blocked",
        "consent_verified": true|false,
        "reference_analysis": {
          "pitch_range": "...",
          "intonation": "...",
          "pace": "...",
          "energy": "...",
          "noise_profile": "..."
        },
        "source_transcript": "...",
        "processing_actions": ["..."],
        "blocked_reason": "..."
      }
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
            consent_verified: { type: Type.BOOLEAN },
            reference_analysis: {
              type: Type.OBJECT,
              properties: {
                pitch_range: { type: Type.STRING },
                intonation: { type: Type.STRING },
                pace: { type: Type.STRING },
                energy: { type: Type.STRING },
                noise_profile: { type: Type.STRING }
              },
              required: ["pitch_range", "intonation", "pace", "energy", "noise_profile"]
            },
            source_transcript: { type: Type.STRING },
            processing_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            blocked_reason: { type: Type.STRING }
          },
          required: [
            "status",
            "consent_verified",
            "reference_analysis",
            "source_transcript",
            "processing_actions",
            "blocked_reason"
          ]
        }
      }
    });

    const responseText = result.text || "{}";
    const parsed = JSON.parse(responseText);
    
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
