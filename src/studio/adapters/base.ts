export type GenerationRequest = {
  id: string;
  project: string;
  prompt: string;
  outputPath: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
};

export type GenerationResult = {
  ok: boolean;
  provider: string;
  path?: string;
  error?: string;
};

export interface GenerationAdapter {
  generate(request: GenerationRequest): Promise<GenerationResult>;
}
