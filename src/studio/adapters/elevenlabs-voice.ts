import type {GenerationAdapter, GenerationRequest, GenerationResult} from './base';
import {ensureOk, writeBinary} from '../http';

export class ElevenLabsVoiceAdapter implements GenerationAdapter {
  async generate(request:GenerationRequest):Promise<GenerationResult> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return {ok:false,provider:'elevenlabs',error:'ELEVENLABS_API_KEY is missing'};
    try {
      const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,{
        method:'POST',
        headers:{'xi-api-key':apiKey,'Content-Type':'application/json'},
        body:JSON.stringify({
          text:request.prompt,
          model_id:process.env.ELEVENLABS_TTS_MODEL || 'eleven_v3'
        })
      });
      await ensureOk(response,'ElevenLabs speech generation');
      writeBinary(request.outputPath,await response.arrayBuffer());
      return {ok:true,provider:'elevenlabs',path:request.outputPath};
    } catch(e) {
      return {ok:false,provider:'elevenlabs',error:String(e)};
    }
  }
}
