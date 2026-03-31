import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { createAiService } from './aiService.ts';

describe('aiService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return original content if GEMINI_API_KEY is not set', async () => {
    process.env.GEMINI_API_KEY = '';
    const MockGoogleGenAI = class {};
    // @ts-ignore
    const service = createAiService(MockGoogleGenAI);
    const content = 'Hello world';
    const result = await service.translateBottle(content, 'zh');
    assert.strictEqual(result, content);
  });

  it('should return translated text on success', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    const MockGoogleGenAI = class {
      models = {
        generateContent: async () => ({
          text: 'Translated text'
        })
      };
    };
    // @ts-ignore
    const service = createAiService(MockGoogleGenAI);
    const content = 'Hello world';
    const result = await service.translateBottle(content, 'zh');
    assert.strictEqual(result, 'Translated text');
  });

  it('should return original content as fallback when AI throws an error', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    const MockGoogleGenAI = class {
      models = {
        generateContent: async () => {
          throw new Error('AI Error');
        }
      };
    };
    // @ts-ignore
    const service = createAiService(MockGoogleGenAI);
    const content = 'Hello world';
    const result = await service.translateBottle(content, 'zh');
    assert.strictEqual(result, content);
  });

  it('should return original content if response.text is empty', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    const MockGoogleGenAI = class {
      models = {
        generateContent: async () => ({
          text: ''
        })
      };
    };
    // @ts-ignore
    const service = createAiService(MockGoogleGenAI);
    const content = 'Hello world';
    const result = await service.translateBottle(content, 'zh');
    assert.strictEqual(result, content);
  });
});
