import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { initializeDatabase } from "./src/server/db.ts";
import {
  requestLogger,
  securityHeaders,
  seoMiddleware,
  errorHandler
} from "./src/server/middleware/index.ts";
import apiRoutes from "./src/server/routes/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  // Initialize Database in background
  initializeDatabase().catch(err => {
    console.error("Database initialization failed:", err);
  });

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(securityHeaders);
  app.use(requestLogger);

  // SEO Middleware
  app.use(seoMiddleware);

  // API Routes
  app.use("/api", apiRoutes);

  // Global Error Handler
  app.use(errorHandler);

  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production" || process.env.ZEABUR === "true";
  
  if (!isProduction) {
    console.log("Starting in development mode with Vite middleware...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("Failed to start Vite server:", err);
    }
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*all", (req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log("Environment:", process.env.NODE_ENV || "development");
    console.log("Zeabur detected:", !!process.env.ZEABUR);
    console.log("Firebase API Key present:", !!process.env.VITE_FIREBASE_API_KEY);
    console.log("Gemini API Key present:", !!process.env.GEMINI_API_KEY);
  });
}

startServer();
