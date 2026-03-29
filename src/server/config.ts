import "dotenv/config";

/**
 * Server Configuration
 * Centralized environment variable management with validation.
 */
export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production" || process.env.ZEABUR === "true",
  isZeabur: process.env.ZEABUR === "true",
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // API Keys
  geminiApiKey: process.env.GEMINI_API_KEY,
  firebaseApiKey: process.env.VITE_FIREBASE_API_KEY,
  
  // Paths
  distPath: "dist",
};

/**
 * Validate required configuration
 */
export function validateConfig() {
  const missing = [];
  
  if (!config.geminiApiKey) missing.push("GEMINI_API_KEY");
  if (!config.firebaseApiKey) missing.push("VITE_FIREBASE_API_KEY");
  
  if (missing.length > 0) {
    console.warn(`[Config] Warning: Missing environment variables: ${missing.join(", ")}`);
    console.warn("[Config] The application may not function correctly.");
  }
}
