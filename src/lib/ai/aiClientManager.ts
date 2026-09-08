import { AnthropicClient } from "./anthropicClient";
import { OpenAIClient } from "./openaiClient";
import { GeminiClient } from "./geminiClient";
import { AIClient, AIClientConfig } from "../grammar/types";

export class AIClientManager {
  private static instance: AIClientManager;
  
  private constructor() {}
  
  static getInstance(): AIClientManager {
    if (!AIClientManager.instance) {
      AIClientManager.instance = new AIClientManager();
    }
    return AIClientManager.instance;
  }
  
  createClient(): AIClient {
    // Get API keys from localStorage
    const claudeApiKey = localStorage.getItem('claude_api_key');
    const gptApiKey = localStorage.getItem('gpt_api_key');
    const geminiApiKey = localStorage.getItem('gemini_api_key');
    
    // Prefer Claude if available, then Gemini, then GPT
    if (claudeApiKey) {
      const config: AIClientConfig = {
        apiKey: claudeApiKey,
        model: 'claude-sonnet-4-5-20250929',
        maxTokens: 4000,
        temperature: 0.7
      };
      return new AnthropicClient(config);
    } else if (geminiApiKey) {
      const config: AIClientConfig = {
        apiKey: geminiApiKey,
        model: 'gemini-3-flash-preview',
        maxTokens: 4000,
        temperature: 0.7
      };
      return new GeminiClient(config);
    } else if (gptApiKey) {
      const config: AIClientConfig = {
        apiKey: gptApiKey,
        model: 'gpt-5-mini-2025-08-07',
        maxTokens: 4000,
        temperature: 0.7
      };
      return new OpenAIClient(config);
    } else {
      throw new Error('API 키가 설정되지 않았습니다. 메인페이지에서 Claude, Gemini 또는 GPT API 키를 설정해주세요.');
    }
  }
  
  getAvailableAPI(): 'claude' | 'gemini' | 'gpt' | null {
    const claudeApiKey = localStorage.getItem('claude_api_key');
    const geminiApiKey = localStorage.getItem('gemini_api_key');
    const gptApiKey = localStorage.getItem('gpt_api_key');
    
    if (claudeApiKey) return 'claude';
    if (geminiApiKey) return 'gemini';
    if (gptApiKey) return 'gpt';
    return null;
  }
}
