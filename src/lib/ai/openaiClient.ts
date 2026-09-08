import OpenAI from "openai";
import { AIClient, AIClientConfig } from "../grammar/types";

export class OpenAIClient implements AIClient {
  private client: OpenAI;
  private config: AIClientConfig;

  constructor(config: AIClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true
    });
    this.config = config;
  }

  async generateCompletion(prompt: string, signal?: AbortSignal): Promise<string> {
    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: this.config.temperature || 0.7,
      top_p: 0.95,
      max_tokens: this.config.maxTokens || 1000,
    }, {
      signal: signal as any
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error("Invalid response format from GPT API");
    }

    return response.choices[0].message.content;
  }
}
