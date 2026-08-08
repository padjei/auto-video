export type SceneType =
  | 'hero' | 'kineticType' | 'metric' | 'quote' | 'split'
  | 'diagram' | 'process' | 'code' | 'ui' | 'image' | 'video' | 'cta';

export type Scene = {
  id:string;
  type:SceneType;
  durationInFrames:number;
  eyebrow?:string;
  headline?:string;
  body?:string;
  metric?:string;
  media?:string;
  mediaFit?:'cover'|'contain';
  accent?:string;
};

export type VideoProject = {
  id:string;
  title:string;
  width:number;
  height:number;
  fps:number;
  background?:string;
  foreground?:string;
  accent?:string;
  voiceover?:string;
  backgroundMusic?:string;
  musicVolume?:number;
  voiceVolume?:number;
  scenes:Scene[];
};
