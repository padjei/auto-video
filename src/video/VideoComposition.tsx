import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import type {VideoProject} from '../types';
import {SceneRenderer} from './SceneRenderer';

export const VideoComposition:React.FC<{project:VideoProject}> = ({project}) => {
  let from = 0;
  return (
    <AbsoluteFill style={{backgroundColor:project.background ?? '#081018'}}>
      {project.scenes.map((scene,index) => {
        const start = from;
        from += scene.durationInFrames;
        return (
          <Sequence key={scene.id} from={start} durationInFrames={scene.durationInFrames}>
            <SceneRenderer scene={scene} index={index} project={project}/>
          </Sequence>
        );
      })}
      {project.backgroundMusic ? (
        <Audio src={staticFile(project.backgroundMusic)} volume={project.musicVolume ?? 0.12}/>
      ) : null}
      {project.voiceover ? (
        <Audio src={staticFile(project.voiceover)} volume={project.voiceVolume ?? 1}/>
      ) : null}
    </AbsoluteFill>
  );
};
