import fs from 'node:fs';
import path from 'node:path';
import type {GenerationAdapter, GenerationRequest, GenerationResult} from './base';
import {ensureOk, downloadFile} from '../http';

export class OpenAIImageAdapter implements GenerationAdapter {
  async generate(request:GenerationRequest):Promise<GenerationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return {ok:false,provider:'openai',error:'OPENAI_API_KEY is missing'};
    try {
      const size = (request.width ?? 1600) >= (request.height ?? 900) ? '1536x1024' : '1024x1536';
      const response = await fetch('https://api.openai.com/v1/images/generations',{
        method:'POST',
        headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
        body:JSON.stringify({
          model:process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
          prompt:request.prompt,
          size,
          quality:'high',
          n:1
        })
      });
      await ensureOk(response,'OpenAI image generation');
      const json:any = await response.json();
      const item = json.data?.[0];
      fs.mkdirSync(path.dirname(request.outputPath),{recursive:true});
      if (item?.b64_json) {
        fs.writeFileSync(request.outputPath,Buffer.from(item.b64_json,'base64'));
        return {ok:true,provider:'openai',path:request.outputPath};
      }
      if (item?.url) {
        await downloadFile(item.url,request.outputPath);
        return {ok:true,provider:'openai',path:request.outputPath};
      }
      throw new Error('No image data returned.');
    } catch(e) {
      return {ok:false,provider:'openai',error:String(e)};
    }
  }
}
