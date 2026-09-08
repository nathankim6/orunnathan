import { Anthropic } from "@anthropic-ai/sdk";
import { AIClient, AIClientConfig } from "../grammar/types";

export class AnthropicClient implements AIClient {
  private client: Anthropic;
  private config: AIClientConfig;

  constructor(config: AIClientConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true
    });
    this.config = config;
  }

  async generateCompletion(prompt: string, signal?: AbortSignal): Promise<string> {
    if (signal?.aborted) {
      throw new Error('AbortError');
    }

    const response = await this.client.messages.create({
      model: this.config.model,
      messages: [{
        role: "user",
        content: prompt
      }],
      max_tokens: this.config.maxTokens || 4000,
      temperature: this.config.temperature || 0.7,
    }, {
      signal: signal as any
    });

    const content = response.content[0];
    if (!content || typeof content !== 'object' || !('type' in content) || content.type !== 'text' || !('text' in content)) {
      throw new Error("Invalid response format from Claude API");
    }

    return content.text;
  }
}
