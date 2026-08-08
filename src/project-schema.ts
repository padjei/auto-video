import {z} from 'zod';

export const SceneSchema = z.object({
  id:z.string(),
  type:z.enum(['hero','kineticType','metric','quote','split','diagram','process','code','ui','image','video','cta']),
  durationInFrames:z.number().int().positive(),
  eyebrow:z.string().optional(),
  headline:z.string().optional(),
  body:z.string().optional(),
  metric:z.string().optional(),
  media:z.string().optional(),
  mediaFit:z.enum(['cover','contain']).optional(),
  accent:z.string().optional()
});

export const VideoProjectSchema = z.object({
  id:z.string(),
  title:z.string(),
  width:z.number().int().positive().default(1920),
  height:z.number().int().positive().default(1080),
  fps:z.number().int().positive().default(30),
  background:z.string().default('#081018'),
  foreground:z.string().default('#F7FAFC'),
  accent:z.string().default('#6EE7F9'),
  voiceover:z.string().optional(),
  backgroundMusic:z.string().optional(),
  musicVolume:z.number().min(0).max(1).default(0.12),
  voiceVolume:z.number().min(0).max(1).default(1),
  scenes:z.array(SceneSchema).min(1)
});
