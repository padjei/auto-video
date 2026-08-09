/**
 * Film assembly.
 *
 * Lays the scenes out back to back (so the composition duration stays exactly
 * `sum(scene.durationInFrames)`, which scripts/studio-render.ts depends on), overlaps
 * the outgoing scene only where a transition needs both halves on screen, stacks the
 * four permitted transitions above them, and finishes the whole film with one grade
 * layer so every archetype resolves to a single film.
 */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import type {TransitionType, VideoProject} from '../types';
import {SceneRenderer, isPhotographic, resolveArchetype} from './SceneRenderer';
import {Grade, GradeDefs, type FinishProfile} from './design/Grade';
import {defaultCameraFor} from './design/camera';
import {C, FONT} from './design/tokens';
import {
  DIP_FRAMES,
  DipToDeep,
  SceneStage,
  StrataWipeLine,
  WIPE_FRAMES,
  tailFramesFor,
} from './transitions';

export const VideoComposition: React.FC<{project: VideoProject}> = ({project}) => {
  const scenes = project.scenes;

  const starts: number[] = [];
  let acc = 0;
  for (const s of scenes) {
    starts.push(acc);
    acc += s.durationInFrames;
  }
  const total = acc;

  // The first scene can never have a transition in — there is nothing to come from.
  const transitionInto = (i: number): TransitionType =>
    i === 0 ? 'cut' : (scenes[i].transition ?? 'cut');

  /**
   * §5 — the finish is driven by what is actually on screen at this frame, so a
   * photographic plate gets grain 0.052 / full vignette and a motion-graphics scene
   * gets 0.034 / half vignette, without either scene having to know about the grade.
   */
  const profileAt = (frame: number): FinishProfile => {
    let idx = scenes.length - 1;
    for (let i = 0; i < scenes.length; i++) {
      if (frame < starts[i] + scenes[i].durationInFrames) {
        idx = i;
        break;
      }
    }
    return {photographic: isPhotographic(resolveArchetype(scenes[idx].type)) ? 1 : 0};
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bgDeep,
        color: C.fgPrimary,
        fontFamily: FONT.text,
        WebkitFontSmoothing: 'antialiased',
        overflow: 'hidden',
      }}
    >
      <GradeDefs />

      {/* ---------------------------------------------------------- scenes */}
      {scenes.map((scene, i) => {
        const head = transitionInto(i);
        const tail: TransitionType =
          i + 1 < scenes.length ? transitionInto(i + 1) : 'cut';
        const extra = tailFramesFor(tail);

        // The standard 9-frame type exit runs only where something is there to catch
        // it — under the dip to deep. A hard cut cuts on movement at full opacity, and
        // a Strata Wipe / Strata Descent dismisses the frame itself (§3, §4.3).
        const exitAt = tail === 'dipToDeep' ? scene.durationInFrames - 12 : null;

        return (
          <Sequence
            key={scene.id}
            name={`${i + 1}. ${resolveArchetype(scene.type)}`}
            from={starts[i]}
            durationInFrames={scene.durationInFrames + extra}
            style={{zIndex: tail === 'strataDescent' ? i * 10 + 15 : i * 10}}
          >
            <SceneStage duration={scene.durationInFrames} head={head} tail={tail}>
              <SceneRenderer
                scene={scene}
                project={project}
                index={i}
                exitAt={exitAt}
                camera={scene.camera ?? defaultCameraFor(i)}
              />
            </SceneStage>
          </Sequence>
        );
      })}

      {/* ------------------------------------------------- T3 leading edges */}
      {scenes.map((scene, i) =>
        transitionInto(i) === 'strataWipe' ? (
          <Sequence
            key={`wipe-${scene.id}`}
            name={`T3 strata wipe → ${scene.id}`}
            from={starts[i]}
            durationInFrames={WIPE_FRAMES}
            style={{zIndex: 9000}}
          >
            <StrataWipeLine />
          </Sequence>
        ) : null,
      )}

      {/* ------------------------------------------------------- T2 dips */}
      {scenes.map((scene, i) =>
        transitionInto(i) === 'dipToDeep' ? (
          <Sequence
            key={`dip-${scene.id}`}
            name={`T2 dip to deep → ${scene.id}`}
            from={Math.max(0, starts[i] - 9)}
            durationInFrames={DIP_FRAMES}
            style={{zIndex: 9100}}
          >
            <DipToDeep />
          </Sequence>
        ) : null,
      )}

      {/* ------------------------------------------------ grade and finish */}
      <AbsoluteFill style={{zIndex: 10000, pointerEvents: 'none'}}>
        <Grade profileAt={profileAt} />
      </AbsoluteFill>

      {project.music ? (
        <Sequence from={0} durationInFrames={total}>
          <Audio src={staticFile(project.music)} volume={0.5} />
        </Sequence>
      ) : null}
      {project.voiceover ? (
        <Sequence from={0} durationInFrames={total}>
          <Audio src={staticFile(project.voiceover)} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
