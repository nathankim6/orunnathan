import { AIClient, AIClientConfig } from "../grammar/types";

export class GeminiClient implements AIClient {
  private config: AIClientConfig;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(config: AIClientConfig) {
    this.config = config;
  }

  async generateCompletion(prompt: string, signal?: AbortSignal): Promise<string> {
    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    const model = this.config.model || 'gemini-3-flash-preview';
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: this.config.temperature || 0.7,
          topP: 0.95,
          maxOutputTokens: this.config.maxTokens || 4000,
        }
      }),
      signal: signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format from Gemini API");
    }

    return data.candidates[0].content.parts[0].text;
  }
}
