import React from 'react';
import {Composition} from 'remotion';
import {VideoComposition} from './video/VideoComposition';
import demo from '../projects/demo/project.json';
import {VideoProjectSchema} from './project-schema';
export const RemotionRoot:React.FC=()=>{const project=VideoProjectSchema.parse(demo); const durationInFrames=project.scenes.reduce((s,x)=>s+x.durationInFrames,0); return <Composition id="AgenticVideo" component={VideoComposition} durationInFrames={durationInFrames} fps={project.fps} width={project.width} height={project.height} defaultProps={{project}}/>;};
