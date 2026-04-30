import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Request Logging Middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  const apiRouter = express.Router();

  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok", service: "Audio Clone API", timestamp: new Date().toISOString() });
  });

  apiRouter.post("/transform", async (req, res) => {
    console.log("Processing transformation request...");
    try {
      const { referenceBase64, sourceBase64, consent } = req.body;

      if (!consent) {
        return res.status(400).json({
          error: "Consent required",
          message: "User did not explicitly confirm consent."
        });
      }

      if (!referenceBase64 || !sourceBase64) {
        return res.status(400).json({
          error: "Missing data",
          message: "Both reference and source audio streams are required."
        });
      }

      const ai = getGenAI();
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `
        Analyze these two audio files for a consent-based audio transformation.
        Reference Audio: Analysis of high-level vocal style attributes only (pitch, cadence, resonance).
        Source Audio: Analysis for speech content, language, and phonetic patterns.
        
        Goal:
        - Preserve linguistic content of source.
        - Extract general acoustic style descriptors from reference.
        - Refuse any request to imitate a real person without authorization.
        - Verify if reference quality is sufficient.
        
        Return a structured JSON output according to the schema.
      `;

      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [
            { text: prompt },
            { inlineData: { mimeType: "audio/mpeg", data: referenceBase64 } },
            { inlineData: { mimeType: "audio/mpeg", data: sourceBase64 } }
          ]}
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              consent_check: {
                type: Type.OBJECT,
                properties: {
                  passed: { type: Type.BOOLEAN },
                  message: { type: Type.STRING }
                },
                required: ["passed", "message"]
              },
              input_validation: {
                type: Type.OBJECT,
                properties: {
                  reference_audio: {
                    type: Type.OBJECT,
                    properties: {
                      status: { type: Type.STRING },
                      notes: { type: Type.STRING }
                    },
                    required: ["status", "notes"]
                  },
                  source_audio: {
                    type: Type.OBJECT,
                    properties: {
                      status: { type: Type.STRING },
                      notes: { type: Type.STRING }
                    },
                    required: ["status", "notes"]
                  }
                },
                required: ["reference_audio", "source_audio"]
              },
              analysis: {
                type: Type.OBJECT,
                properties: {
                  reference_style_summary: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  source_transcript: { type: Type.STRING },
                  source_language: { type: Type.STRING }
                },
                required: ["reference_style_summary", "source_transcript", "source_language"]
              },
              transformation_plan: {
                type: Type.OBJECT,
                properties: {
                  pipeline: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommended_models: { type: Type.ARRAY, items: { type: Type.STRING } },
                  post_processing: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["pipeline", "recommended_models", "post_processing"]
              },
              safety: {
                type: Type.OBJECT,
                properties: {
                  risk_level: { type: Type.STRING },
                  blocked_reason: { type: Type.STRING }
                },
                required: ["risk_level", "blocked_reason"]
              },
              final_response: { type: Type.STRING }
            },
            required: [
              "consent_check",
              "input_validation",
              "analysis",
              "transformation_plan",
              "safety",
              "final_response"
            ]
          }
        }
      });

      const responseText = result.response.text();
      res.json(JSON.parse(responseText));

    } catch (error: any) {
      console.error("Gemini processing error:", error.message);
      res.status(500).json({
        error: "Processing failed",
        message: error.message || "An error occurred during audio orchestration."
      });
    }
  });

  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
