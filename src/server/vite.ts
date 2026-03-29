import express, { Express } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { config } from "./config.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Setup Frontend Serving
 * Handles development (Vite middleware) vs. production (static files).
 */
export async function setupFrontend(app: Express) {
  if (!config.isProduction) {
    console.log("[Vite] Starting in development mode with Vite middleware...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("[Vite] Failed to start Vite server:", err);
    }
  } else {
    // Production static serving
    const distPath = path.resolve(process.cwd(), config.distPath);
    if (fs.existsSync(distPath)) {
      console.log(`[Static] Serving from ${distPath}`);
      app.use(express.static(distPath));
      app.get("*all", (req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    } else {
      console.warn(`[Static] Warning: ${distPath} does not exist. Frontend will not be served.`);
    }
  }
}
