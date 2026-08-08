import React from 'react';
import {
  AbsoluteFill, Img, OffthreadVideo, interpolate, spring,
  staticFile, useCurrentFrame, useVideoConfig
} from 'remotion';
import type {Scene,VideoProject} from '../types';

const clamp = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const isVideo = (p:string) => /\.(mp4|mov|webm|m4v)$/i.test(p);

export const SceneRenderer:React.FC<{scene:Scene;project:VideoProject;index:number}> = ({scene,project,index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({fps,frame,config:{damping:18,stiffness:110}});
  const exit = interpolate(frame,[Math.max(0,scene.durationInFrames-12),scene.durationInFrames],[1,0],clamp);
  const opacity = Math.min(enter,exit);
  const y = interpolate(enter,[0,1],[50,0]);
  const scale = interpolate(enter,[0,1],[0.97,1]);
  const accent = scene.accent ?? project.accent ?? '#6EE7F9';

  const mediaLayer = scene.media ? (
    isVideo(scene.media) ? (
      <OffthreadVideo
        src={staticFile(scene.media)}
        muted
        style={{
          position:'absolute',inset:0,width:'100%',height:'100%',
          objectFit:scene.mediaFit ?? 'cover',opacity:0.58
        }}
      />
    ) : (
      <Img
        src={staticFile(scene.media)}
        style={{
          position:'absolute',inset:0,width:'100%',height:'100%',
          objectFit:scene.mediaFit ?? 'cover',opacity:0.58
        }}
      />
    )
  ) : null;

  return (
    <AbsoluteFill style={{
      overflow:'hidden',
      color:project.foreground ?? '#F7FAFC',
      fontFamily:'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      background:index%2===0
        ? 'radial-gradient(circle at 78% 20%, rgba(57,189,248,.16), transparent 32%), linear-gradient(135deg,#061019,#0B1722)'
        : 'radial-gradient(circle at 18% 78%, rgba(139,92,246,.15), transparent 32%), linear-gradient(135deg,#07111A,#111827)'
    }}>
      {mediaLayer}
      {scene.media ? <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(3,9,15,.86),rgba(3,9,15,.38))'}}/> : null}

      <div style={{
        position:'absolute',inset:0,opacity:0.14,
        backgroundImage:'linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)',
        backgroundSize:'64px 64px',transform:`translateY(${(frame*0.25)%64}px)`
      }}/>

      <div style={{
        position:'relative',width:'82%',margin:'auto',
        transform:`translateY(${y}px) scale(${scale})`,opacity
      }}>
        {scene.eyebrow && <div style={{color:accent,fontSize:26,letterSpacing:4,textTransform:'uppercase',marginBottom:24}}>{scene.eyebrow}</div>}
        {scene.metric && <div style={{fontSize:160,fontWeight:800,color:accent,lineHeight:.95,marginBottom:24}}>{scene.metric}</div>}
        {scene.headline && <div style={{fontSize:scene.type==='cta'?92:80,fontWeight:750,lineHeight:1.02,maxWidth:1450,textShadow:'0 10px 35px rgba(0,0,0,.35)'}}>{scene.headline}</div>}
        {scene.body && <div style={{fontSize:36,lineHeight:1.35,opacity:.82,maxWidth:1120,marginTop:30}}>{scene.body}</div>}
      </div>

      <div style={{position:'absolute',left:80,right:80,bottom:54,height:2,background:'rgba(255,255,255,.12)'}}>
        <div style={{height:'100%',width:`${Math.min(100,(frame/Math.max(1,scene.durationInFrames-1))*100)}%`,background:accent}}/>
      </div>
    </AbsoluteFill>
  );
};
