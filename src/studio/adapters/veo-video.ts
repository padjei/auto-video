import {execFileSync} from 'node:child_process';
import type {GenerationAdapter, GenerationRequest, GenerationResult} from './base';
import {ensureOk, sleep} from '../http';

export class VeoVideoAdapter implements GenerationAdapter {
  async generate(request:GenerationRequest):Promise<GenerationResult> {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const storageUri = process.env.GOOGLE_CLOUD_STORAGE_URI;
    const model = process.env.VEO_MODEL || 'veo-3.1-fast-generate-001';

    if (!project || !storageUri) {
      return {ok:false,provider:'veo',error:'GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_STORAGE_URI is missing'};
    }

    try {
      const token = execFileSync('gcloud',['auth','application-default','print-access-token'],{encoding:'utf8'}).trim();
      const base = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}`;
      const aspectRatio = (request.width ?? 1920) >= (request.height ?? 1080) ? '16:9' : '9:16';

      const create = await fetch(`${base}:predictLongRunning`,{
        method:'POST',
        headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
        body:JSON.stringify({
          instances:[{prompt:request.prompt}],
          parameters:{
            storageUri,
            sampleCount:1,
            aspectRatio,
            durationSeconds:8,
            resolution:'1080p'
          }
        })
      });

      await ensureOk(create,'Veo generation');
      const created:any = await create.json();
      if (!created.name) throw new Error('Veo did not return operation name.');

      for (let attempt=0; attempt<80; attempt++) {
        await sleep(15000);
        const poll = await fetch(`${base}:fetchPredictOperation`,{
          method:'POST',
          headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
          body:JSON.stringify({operationName:created.name})
        });
        await ensureOk(poll,'Veo operation poll');
        const state:any = await poll.json();

        if (state.done) {
          const uri = state.response?.videos?.[0]?.gcsUri;
          if (!uri) throw new Error(`Veo completed without gcsUri: ${JSON.stringify(state)}`);
          execFileSync('gcloud',['storage','cp',uri,request.outputPath],{stdio:'inherit'});
          return {ok:true,provider:'veo',path:request.outputPath};
        }
      }
      throw new Error('Veo generation timed out.');
    } catch(e) {
      return {ok:false,provider:'veo',error:String(e)};
    }
  }
}
