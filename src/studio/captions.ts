import fs from 'node:fs';
import path from 'node:path';

const stamp=(seconds:number)=>{
  const ms=Math.max(0,Math.round(seconds*1000));
  const h=Math.floor(ms/3600000);
  const m=Math.floor((ms%3600000)/60000);
  const s=Math.floor((ms%60000)/1000);
  const x=ms%1000;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(x).padStart(3,'0')}`;
};

export function makeCaptions(project:string) {
  const dir=path.resolve('projects',project);
  const narrationPath=path.join(dir,'narration.json');
  if (!fs.existsSync(narrationPath)) return null;

  const narration:any=JSON.parse(fs.readFileSync(narrationPath,'utf8'));
  const text=(narration.text ?? '').trim();
  if (!text) return null;

  const projectData:any=JSON.parse(fs.readFileSync(path.join(dir,'project.json'),'utf8'));
  const totalSeconds=(projectData.scenes ?? []).reduce((n:number,s:any)=>n+s.durationInFrames,0)/(projectData.fps || 30);

  const sentences=(text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text]).map((s:string)=>s.trim()).filter(Boolean);
  const weights=sentences.map((s:string)=>Math.max(1,s.split(/\s+/).length));
  const totalWeight=weights.reduce((a:number,b:number)=>a+b,0);

  let cursor=0;
  const blocks:string[]=[];
  sentences.forEach((sentence:string,index:number)=>{
    const duration=totalSeconds*(weights[index]/totalWeight);
    const start=cursor;
    const end=Math.min(totalSeconds,cursor+duration);
    blocks.push(`${index+1}\n${stamp(start)} --> ${stamp(end)}\n${sentence}\n`);
    cursor=end;
  });

  const out=path.join(dir,'captions.srt');
  fs.writeFileSync(out,blocks.join('\n'));
  return out;
}
