import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Helper for resilient Gemini API calls with automatic retry & fallback
  async function generateWithFallback(
    client: GoogleGenAI,
    params: {
      contents: any;
      config: any;
      primaryModel?: string;
      fallbackModels?: string[];
    }
  ) {
    const models = [
      params.primaryModel || "gemini-3.8-flash",
      ...(params.fallbackModels || ["gemini-2.5-flash"])
    ];

    let lastError: any = null;
    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          return await client.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          });
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          const isTransient = 
            errMsg.includes("503") || 
            errMsg.includes("high demand") || 
            errMsg.includes("UNAVAILABLE") ||
            errMsg.includes("429") ||
            errMsg.includes("RESOURCE_EXHAUSTED");
          
          console.warn(`[Gemini API] Request failed with model ${model} (attempt ${attempt + 1}): ${errMsg}`);
          
          if (isTransient && attempt === 0) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          break;
        }
      }
    }
    throw lastError;
  }

  function formatErrorMessage(error: any): string {
    let raw = error?.message || String(error);
    try {
      const jsonCandidate = raw.replace(/^ApiError:\s*/, "");
      const parsed = JSON.parse(jsonCandidate);
      if (parsed?.error?.message) {
        if (parsed.error.code === 503 || parsed.error.status === "UNAVAILABLE" || parsed.error.message.includes("high demand")) {
          return "Model AI sedang mengalami lonjakan permintaan tinggi (high demand). Mohon tunggu sejenak dan coba kirim ulang pesan Anda.";
        }
        return parsed.error.message;
      }
    } catch {
      // Not JSON string
    }

    if (raw.includes("503") || raw.includes("high demand") || raw.includes("UNAVAILABLE")) {
      return "Model AI sedang mengalami lonjakan permintaan tinggi (high demand). Mohon tunggu sejenak dan coba kirim ulang pesan Anda.";
    }

    return raw;
  }

  // API Route for Chat Mode
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, contextData, apiKey } = req.body;
      
      const chatAi = apiKey ? new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      }) : ai;

      let contents = prompt;
      if (contextData) {
        contents = `Context Data from monitoring table:\n${contextData}\n\nUser Question:\n${prompt}`;
      }

      const response = await generateWithFallback(chatAi, {
        primaryModel: "gemini-3.8-flash",
        fallbackModels: ["gemini-2.5-flash"],
        contents: contents,
        config: {
          systemInstruction: "Kamu adalah AI yang ahli dalam bidang lingkungan, ekosistem, dan ilmu pengetahuan alam. Jawablah pertanyaan pengguna berdasarkan data real-time, data dari cloud database, serta pengetahuan ilmiah terpercaya. Tolak secara sopan pertanyaan yang tidak berkaitan dengan topik lingkungan, ekosistem, dan sampah.",
          tools: [{ googleSearch: {} }],
        }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("[Chat Error]:", error);
      res.status(500).json({ error: formatErrorMessage(error) });
    }
  });

  // API Route for Agentic Mode
  const generateTableDeclaration: FunctionDeclaration = {
    name: "generate_table",
    description: "Generate a table from ecosystem data.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        columns: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of column headers."
        },
        rows: {
          type: Type.ARRAY,
          items: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          description: "List of rows, where each row is a list of cell values."
        }
      },
      required: ["columns", "rows"]
    }
  };

  const generateChartDeclaration: FunctionDeclaration = {
    name: "generate_chart",
    description: "Generate a chart from ecosystem data. Use 'line' type for trend charts or time-series data.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          description: "Type of chart: 'bar', 'line', or 'pie'.",
          enum: ["bar", "line", "pie"]
        },
        data: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The label for the x-axis or category (e.g., date or category name)" },
              value: { type: Type.NUMBER, description: "The numerical value" }
            },
            required: ["name", "value"]
          },
          description: "Data points for the chart."
        }
      },
      required: ["type", "data"]
    }
  };

  const summarizeDatabaseDeclaration: FunctionDeclaration = {
    name: "summarize_database",
    description: "Summarize the given ecosystem database data.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.STRING,
          description: "A comprehensive summary of the provided data."
        }
      },
      required: ["summary"]
    }
  };

  app.post("/api/agentic", async (req, res) => {
    try {
      const { prompt, contextData, apiKey } = req.body;
      
      const agenticAi = apiKey ? new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      }) : ai;
      
      let contents = prompt;
      if (contextData) {
        contents = `Context Data from monitoring table:\n${contextData}\n\nUser Question:\n${prompt}`;
      }

      const response = await generateWithFallback(agenticAi, {
        primaryModel: "gemini-3.8-flash",
        fallbackModels: ["gemini-2.5-flash"],
        contents: contents,
        config: {
          systemInstruction: "Kamu adalah Asisten Agentic AI yang berpikir secara rasional menyesuaikan data dari cloud database untuk menyelesaikan tugas yang diberikan seperti menyusun tabel, membuat grafik, serta membuat ringkasan dari database sesuai dengan perintah. Selalu panggil fungsi (function call) yang sesuai untuk menampilkan hasil jika diminta membuat tabel atau grafik.",
          tools: [{
            functionDeclarations: [
              generateTableDeclaration,
              generateChartDeclaration,
              summarizeDatabaseDeclaration
            ]
          }]
        }
      });
      
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        res.json({ 
          action: call.name, 
          args: call.args 
        });
      } else {
        res.json({ text: response.text });
      }
    } catch (error: any) {
      console.error("[Agentic Error]:", error);
      res.status(500).json({ error: formatErrorMessage(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
