import express from "express";
import {
  requestLogger,
  securityHeaders,
  seoMiddleware,
  errorHandler
} from "./middleware/index.ts";
import apiRoutes from "./routes/index.ts";

/**
 * Express Application Setup
 * Configures middleware, routes, and error handling.
 */
export function createApp() {
  const app = express();

  // Basic Middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(securityHeaders);
  app.use(requestLogger);

  // SEO Middleware
  app.use(seoMiddleware);

  // API Routes
  app.use("/api", apiRoutes);

  // Global Error Handler (Must be last)
  app.use(errorHandler);

  return app;
}
