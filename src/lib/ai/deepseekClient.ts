import { AIClient, AIClientConfig } from "../grammar/types";

export class DeepseekClient implements AIClient {
  private config: AIClientConfig;

  constructor(config: AIClientConfig) {
    this.config = config;
  }

  async generateCompletion(prompt: string, signal?: AbortSignal): Promise<string> {
    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: this.config.temperature || 0.7,
        top_p: 0.95,
        max_tokens: this.config.maxTokens || 1000,
      }),
      signal: signal
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices[0]?.message?.content) {
      throw new Error("Invalid response format from DeepSeek API");
    }

    return data.choices[0].message.content;
  }
}
