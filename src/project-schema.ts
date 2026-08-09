import {z} from 'zod';

export const ArchetypeEnum = z.enum([
  'cinematicPlate',
  'statementCard',
  'strataDescent',
  'architectureDiagram',
  'engineeringVignette',
  'assuranceTriad',
  'disciplineGrid',
  'credentialBlock',
  'ctaLockup',
]);

export const LegacyTypeEnum = z.enum([
  'hero',
  'kineticType',
  'metric',
  'quote',
  'split',
  'diagram',
  'process',
  'code',
  'ui',
  'image',
  'video',
  'cta',
]);

export const SceneTypeSchema = z.union([ArchetypeEnum, LegacyTypeEnum]);

export const TransitionSchema = z.enum(['cut', 'dipToDeep', 'strataWipe', 'strataDescent']);
export const CameraSchema = z.enum(['push', 'settle', 'hold']);

export const DiagramNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  col: z.number().int().min(0),
  row: z.number().int().min(0),
});

export const DiagramPathSchema = z.object({
  from: z.string(),
  to: z.string(),
  flow: z.boolean().optional(),
});

export const DiagramSchema = z.object({
  tiers: z.array(z.string()).optional(),
  nodes: z.array(DiagramNodeSchema).optional(),
  paths: z.array(DiagramPathSchema).optional(),
  active: z.string().optional(),
  depth: z.number().int().min(0).max(2).optional(),
});

export const StratumSchema = z.object({
  label: z.string(),
  note: z.string().optional(),
});

export const TriadSchema = z.object({
  label: z.string().optional(),
  title: z.string(),
  body: z.string().optional(),
});

export const CredentialFieldSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
});

export const CredentialSchema = z.object({
  fields: z.array(CredentialFieldSchema).optional(),
  footnote: z.string().optional(),
  over: z.enum(['plate', 'base']).optional(),
});

export const CtaSchema = z.object({
  wordmark: z.string().optional(),
  wordmarkSub: z.string().optional(),
  url: z.string().optional(),
  /** path under public/ to a vector mark; inlined and tinted via currentColor */
  mark: z.string().optional(),
});

export const SceneSchema = z.object({
  id: z.string(),
  type: SceneTypeSchema,
  durationInFrames: z.number().int().positive(),

  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  body: z.string().optional(),
  caption: z.string().optional(),
  metric: z.string().optional(),
  media: z.string().optional(),

  transition: TransitionSchema.optional(),
  camera: CameraSchema.optional(),
  scrim: z.number().min(0).max(1).optional(),

  strata: z.array(StratumSchema).optional(),
  diagram: DiagramSchema.optional(),
  triad: z.array(TriadSchema).optional(),
  disciplines: z.array(z.string()).optional(),
  credential: CredentialSchema.optional(),
  cta: CtaSchema.optional(),

  accent: z.string().optional(),
});

export const VideoProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  width: z.number().int().positive().default(1920),
  height: z.number().int().positive().default(1080),
  fps: z.number().int().positive().default(30),
  background: z.string().default('#0B1523'),
  foreground: z.string().default('#F2EFE8'),
  accent: z.string().default('#C6A15B'),
  voiceover: z.string().optional(),
  music: z.string().optional(),
  scenes: z.array(SceneSchema).min(1),
});

export type ParsedVideoProject = z.infer<typeof VideoProjectSchema>;
