import {OpenAIImageAdapter} from './adapters/openai-image';
import {LocalImageAdapter} from './adapters/local-image';
import {RunwayVideoAdapter} from './adapters/runway-video';
import {VeoVideoAdapter} from './adapters/veo-video';
import {LocalVideoAdapter} from './adapters/local-video';
import {ElevenLabsVoiceAdapter} from './adapters/elevenlabs-voice';
import {OpenAIVoiceAdapter} from './adapters/openai-voice';
import {MacOSVoiceAdapter} from './adapters/macos-voice';
import {ElevenLabsMusicAdapter} from './adapters/elevenlabs-music';

export function imageAdapter(name:string) {
  if (name === 'openai') return new OpenAIImageAdapter();
  return new LocalImageAdapter();
}

export function videoAdapter(name:string) {
  if (name === 'runway') return new RunwayVideoAdapter();
  if (name === 'veo') return new VeoVideoAdapter();
  return new LocalVideoAdapter();
}

export function voiceAdapter(name:string) {
  if (name === 'elevenlabs') return new ElevenLabsVoiceAdapter();
  if (name === 'openai') return new OpenAIVoiceAdapter();
  return new MacOSVoiceAdapter();
}

export function musicAdapter(name:string) {
  if (name === 'elevenlabs') return new ElevenLabsMusicAdapter();
  return null;
}
