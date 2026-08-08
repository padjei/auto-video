import {ensureOk, writeBinary} from '../http';

export type MusicRequest = {project:string;prompt:string;outputPath:string;durationSeconds:number};

export class ElevenLabsMusicAdapter {
  async generate(request:MusicRequest) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return {ok:false,provider:'elevenlabs',error:'ELEVENLABS_API_KEY is missing'};
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_48000_192',{
        method:'POST',
        headers:{'xi-api-key':apiKey,'Content-Type':'application/json'},
        body:JSON.stringify({
          prompt:request.prompt,
          music_length_ms:Math.max(3000,Math.round(request.durationSeconds*1000)),
          model_id:process.env.ELEVENLABS_MUSIC_MODEL || 'music_v2',
          force_instrumental:true,
          sign_with_c2pa:true
        })
      });
      await ensureOk(response,'ElevenLabs music generation');
      writeBinary(request.outputPath,await response.arrayBuffer());
      return {ok:true,provider:'elevenlabs',path:request.outputPath};
    } catch(e) {
      return {ok:false,provider:'elevenlabs',error:String(e)};
    }
  }
}
