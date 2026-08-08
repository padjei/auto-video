export type ProductionPhase =
  | 'INTAKE' | 'STRATEGY' | 'STORYBOARD' | 'ASSET_PLAN'
  | 'ASSET_PRODUCTION' | 'AUDIO' | 'EDIT' | 'DRAFT_RENDER'
  | 'QA' | 'REVISION' | 'FINAL_RENDER' | 'DELIVERY' | 'COMPLETE';

export type ProductionState = {
  project: string;
  phase: ProductionPhase;
  revisionCycle: number;
  startedAt: string;
  updatedAt: string;
  errors: string[];
};

export type AssetRequest = {
  id: string;
  sceneId: string;
  type: 'image' | 'video' | 'audio' | 'ui' | 'diagram';
  required: boolean;
  prompt?: string;
  durationSeconds?: number;
  aspectRatio?: string;
  providerPreference?: string;
  fallback?: string;
};

export type AssetManifestItem = {
  id: string;
  sceneId: string;
  type: string;
  path: string;
  source: string;
  provider: string;
  prompt?: string;
  provenance?: string;
  approved: boolean;
};
