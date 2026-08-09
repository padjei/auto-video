/**
 * The NISTA mark, rendered as a MONOCHROME KNOCKOUT.
 *
 * The asset is inlined rather than dropped into an <Img>, for two reasons that both
 * matter to §2: the file's strokes are authored as `currentColor`, so inlining is the
 * only way the film can tint it to `fg/primary` warm off-white instead of shipping the
 * brand's excluded violet/mint; and an inline SVG cannot fail to a broken-image box on
 * the final frame of the film. A fetch failure renders nothing at all.
 *
 * No draw-on, no assembly, no spin (§6.5) — the mark only ever takes the standard
 * 14-frame mask reveal from its parent.
 */
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const sized = (markup: string, size: number) =>
  markup
    // strip the authored 512px box; `stroke-width` is untouched (no whitespace before it)
    .replace(/\s(?:width|height)="[^"]*"/g, '')
    .replace(/<svg/, `<svg width="${size}" height="${size}"`);

export const VectorMark: React.FC<{
  src?: string;
  /** rendered box in px — the hexagon reads at ~0.66 of this */
  size: number;
  color: string;
  opacity?: number;
}> = ({src, size, color, opacity = 1}) => {
  const [markup, setMarkup] = useState<string | null>(null);
  const [handle] = useState(() => (src ? delayRender(`mark ${src}`) : null));

  useEffect(() => {
    if (!src || handle === null) return;
    let cancelled = false;
    const url = /^https?:\/\//.test(src) ? src : staticFile(src.replace(/^\/+/, ''));
    const done = (value: string) => {
      if (cancelled) return;
      setMarkup(value);
      continueRender(handle);
    };
    fetch(url)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
      .then((text) => done(/<svg/i.test(text) ? text : ''))
      .catch(() => done(''));
    return () => {
      cancelled = true;
    };
  }, [src, handle]);

  if (!markup) return null;

  return (
    <div
      style={{width: size, height: size, color, opacity, lineHeight: 0}}
      dangerouslySetInnerHTML={{__html: sized(markup, size)}}
    />
  );
};
