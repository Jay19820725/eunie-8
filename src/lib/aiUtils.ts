import { GenerateContentResponse } from "@google/genai";

/**
 * Utility to execute an AI task with exponential backoff retry logic.
 * Specifically handles 429 (Rate Limit/Quota) errors.
 */
export async function withRetry<T>(
  task: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await task();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      const isRateLimit = 
        error?.message?.includes('429') || 
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.status === 429;
        
      if (isRateLimit && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`AI Rate limit reached. Retrying in ${delay}ms (Attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not a rate limit error or we've exhausted retries, throw
      throw error;
    }
  }
  
  throw lastError;
}
