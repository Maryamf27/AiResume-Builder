export interface AIConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface AIRequestOptions {
  systemPrompt: string;

  userPrompt: string;


  temperature?: number;

  
  maxTokens?: number;

  jsonMode?: boolean;
  operationName?: string;
  signal?: AbortSignal;
}

export interface AIResponse {
  success: true;
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type AIErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_CONFIG"
  | "INVALID_REQUEST"
  | "PROVIDER_ERROR"
  | "RATE_LIMIT"
  | "PROVIDER_RATE_LIMIT"
  | "QUOTA_EXHAUSTED"
  | "INSUFFICIENT_CREDITS"
  | "MODEL_UNAVAILABLE"
  | "TIMEOUT"
  | "INVALID_RESPONSE"
  | "SCHEMA_VALIDATION_FAILED"
  | "UNKNOWN_ERROR";

export interface AIError {
  success: false;
  code: AIErrorCode;
  message: string;
}

export type AIResult = AIResponse | AIError;
