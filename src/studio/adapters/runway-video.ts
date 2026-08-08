import type {GenerationAdapter, GenerationRequest, GenerationResult} from './base';
import {ensureOk, sleep, downloadFile} from '../http';

export class RunwayVideoAdapter implements GenerationAdapter {
  async generate(request:GenerationRequest):Promise<GenerationResult> {
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) return {ok:false,provider:'runway',error:'RUNWAY_API_KEY is missing'};

    try {
      const ratio = (request.width ?? 1920) >= (request.height ?? 1080) ? '1280:720' : '720:1280';
      const duration = Math.max(3,Math.min(10,Math.round(request.durationSeconds ?? 5)));

      const create = await fetch('https://api.dev.runwayml.com/v1/text_to_video',{
        method:'POST',
        headers:{
          'Authorization':`Bearer ${apiKey}`,
          'Content-Type':'application/json',
          'X-Runway-Version':'2024-11-06'
        },
        body:JSON.stringify({
          model:process.env.RUNWAY_VIDEO_MODEL || 'gen4.5',
          promptText:request.prompt.slice(0,1000),
          ratio,
          duration
        })
      });

      await ensureOk(create,'Runway text-to-video');
      const task:any = await create.json();
      if (!task.id) throw new Error('Runway did not return task id.');

      for (let attempt=0; attempt<80; attempt++) {
        await sleep(5000);
        const poll = await fetch(`https://api.dev.runwayml.com/v1/tasks/${task.id}`,{
          headers:{
            'Authorization':`Bearer ${apiKey}`,
            'X-Runway-Version':'2024-11-06'
          }
        });
        await ensureOk(poll,'Runway task poll');
        const state:any = await poll.json();

        if (state.status === 'SUCCEEDED') {
          const url = state.output?.[0];
          if (!url) throw new Error('Runway succeeded without an output URL.');
          await downloadFile(url,request.outputPath);
          return {ok:true,provider:'runway',path:request.outputPath};
        }
        if (state.status === 'FAILED' || state.status === 'CANCELED') {
          throw new Error(`Runway ${state.status}: ${JSON.stringify(state.failure ?? state)}`);
        }
      }
      throw new Error('Runway generation timed out.');
    } catch(e) {
      return {ok:false,provider:'runway',error:String(e)};
    }
  }
}
