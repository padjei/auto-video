import type {GenerationAdapter, GenerationRequest, GenerationResult} from './base';

export class ReplicateImageAdapter implements GenerationAdapter {
  async generate(_request: GenerationRequest): Promise<GenerationResult> {
    return {
      ok: false,
      provider: 'replicate-image',
      error: 'Adapter stub: implement against the provider current SDK/API, then enable it in config/providers.json.'
    };
  }
}
