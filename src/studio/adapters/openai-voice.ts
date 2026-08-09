import type {GenerationAdapter, GenerationRequest, GenerationResult} from './base';
import {ensureOk, writeBinary} from '../http';

export class OpenAIVoiceAdapter implements GenerationAdapter {
  async generate(request:GenerationRequest):Promise<GenerationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return {ok:false,provider:'openai',error:'OPENAI_API_KEY is missing'};
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech',{
        method:'POST',
        headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
        body:JSON.stringify({
          model:process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
          input:request.prompt,
          voice:request.voiceId || 'alloy',
          response_format:'mp3',
          instructions:'Professional cinematic narration. Natural pacing, confident, warm, restrained, not salesy.'
        })
      });
      await ensureOk(response,'OpenAI speech generation');
      writeBinary(request.outputPath,await response.arrayBuffer());
      return {ok:true,provider:'openai',path:request.outputPath};
    } catch(e) {
      return {ok:false,provider:'openai',error:String(e)};
    }
  }
}
