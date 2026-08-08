import fs from 'node:fs';
import path from 'node:path';

export function syncProjectMedia(project:string) {
  const dir=path.resolve('projects',project);
  const projectPath=path.join(dir,'project.json');
  if (!fs.existsSync(projectPath)) throw new Error(`Missing ${projectPath}`);

  const data:any=JSON.parse(fs.readFileSync(projectPath,'utf8'));

  const assetManifestPath=path.join(dir,'asset-manifest.json');
  if (fs.existsSync(assetManifestPath)) {
    const assets:any[]=JSON.parse(fs.readFileSync(assetManifestPath,'utf8'));
    for (const scene of data.scenes ?? []) {
      const asset=assets.find(a=>a.sceneId===scene.id && a.approved);
      if (asset) scene.media=asset.path;
    }
  }

  const audioManifestPath=path.join(dir,'audio-manifest.json');
  if (fs.existsSync(audioManifestPath)) {
    const audio:any=JSON.parse(fs.readFileSync(audioManifestPath,'utf8'));
    if (audio.voiceover) data.voiceover=audio.voiceover;
    if (audio.backgroundMusic) data.backgroundMusic=audio.backgroundMusic;
    data.musicVolume ??= 0.12;
    data.voiceVolume ??= 1;
  }

  fs.writeFileSync(projectPath,JSON.stringify(data,null,2));
  return data;
}
