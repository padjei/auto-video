# NISTA Technologies — Launch Film
## Art Direction & Creative System

**Project:** `nista-launch` · **Format:** 16:9, 1920×1080, 30fps, 1800 frames
**Audience:** Federal CIOs / CTOs / program leaders · **Placement:** LinkedIn feed (sound-off first) + nistatech.com hero
**Status:** STRATEGY — binding art direction for storyboard-director, visual-director, prompt-engineer, motion-designer, video-editor, video-qa.

This document is the single source of truth for look. Where it conflicts with the existing
`src/video/SceneRenderer.tsx`, this document wins — that renderer's cyan/violet neon system is
explicitly rejected (see §7).

---

## 1. Creative concept

**THE LOAD-BEARING LAYER.**

Every federal mission rests on software nobody in the room can see. The film's organizing idea is
that NISTA builds the *structural* layer — the tier beneath the dashboards, the portals and the
press releases, where availability, integrity and recovery are either engineered in or absent.
The film is therefore built as a single continuous **descent and return**: we open on the visible,
institutional surface (a secure operations floor, an agency corridor at dusk, hands on a keyboard),
then move *downward and inward* through successive strata — interface, service, platform,
substrate — until the picture resolves into pure architecture, and then rise back to the human
surface with the mission still running. Nothing accelerates; the camera never cuts sideways, only
through. This is defensible to a skeptical buyer because it makes exactly one claim, and it is a
claim about *method*, not about performance: engineers designed and built this from the bottom up.
It requires no ATO, no past performance, no named agency, no invented metric. It sells the thing
NISTA can actually prove — that the people who architect the system are the people who ship it —
and it converts the brand's own words ("We don't just describe technology. We build it") into a
spatial argument the viewer feels before they read it.

**One-line brief for every downstream agent:** *We are showing the layer underneath the mission.*

---

## 2. Color system

Deep navy, gunmetal steel, warm paper-white, with a single **operations-amber** signal. Amber is
chosen deliberately: it is the status color of a real operations floor and an aerospace
instrument panel, not the neon of a consumer AI product. Steel blue is the structural color and is
never used to shout.

### Tokens (exact)

| Token | Hex | Role |
|---|---|---|
| `bg/base` | `#0B1523` | Default frame background. Deep navy-black. Every scene starts here. |
| `bg/deep` | `#060C15` | Vignette floor, scrim color, letterbox-free frame edges, CTA card. |
| `bg/elevated` | `#141F2E` | Panels, diagram plates, credential block fill, card surfaces. |
| `bg/raised` | `#1B2938` | Topmost surface only (active diagram node fill, hovered/highlighted tier). |
| `line/hairline` | `#24344A` | 1px structural rules, grid, inactive diagram strokes. |
| `line/strong` | `#2C3E56` | 2px separators, panel borders, active container edges. |
| `fg/primary` | `#F2EFE8` | Headlines and all primary type. **Warm** off-white (not `#FFFFFF`). |
| `fg/secondary` | `#9DAABA` | Subheads, body, captions, labels. Cool steel grey. |
| `fg/tertiary` | `#6B7A8C` | Legal, disclaimers, metadata, axis labels. Never above 22px. |
| `accent/signal` | `#C6A15B` | **Operations amber/brass.** The only "hot" color in the film. |
| `accent/signal-lift` | `#D8B778` | Amber at peak of an animation beat only (≤14 frames), then returns to `#C6A15B`. |
| `accent/support` | `#5B8AB4` | Steel blue. Data paths, secondary diagram strokes, non-critical figures. |
| `accent/support-lift` | `#7FA6C9` | Steel blue for small text (≥AA on all backgrounds). |

### Contrast (WCAG 2.1, computed)

Against `bg/base #0B1523`:
`fg/primary` **15.96:1** · `fg/secondary` **7.76:1** · `accent/signal` **7.55:1** ·
`accent/support-lift` **7.16:1** · `accent/support` **5.01:1** · `fg/tertiary` **3.46:1**

Against `bg/elevated #141F2E`:
`fg/primary` **14.45:1** · `fg/secondary` **7.03:1** · `accent/signal` **6.84:1** ·
`accent/support` **4.54:1**

**Rules that follow from those numbers:**
- `fg/tertiary #6B7A8C` is **large-text-only (≥24px) or non-text**. Do not set 18px legal in it on
  `bg/elevated`. Legal at 18px uses `fg/secondary` at 60% → set it as `#9DAABA` with `opacity: 0.75`
  (effective ≈ 5.4:1), never lower.
- `accent/support #5B8AB4` is **never used for type below 28px**. Use `accent/support-lift #7FA6C9`.

### Text over generated photography

All type on a photographic plate sits on a scrim. **Minimum scrim opacity at the type anchor is
0.82** of `bg/deep #060C15`. Verified worst case (type over a blown-out white window in the plate):
`fg/primary` **10.32:1**, `fg/secondary` **5.02:1**, `accent/signal` **4.88:1** — all pass AA.

Standard scrim (apply to every photographic scene carrying type):

```css
background: linear-gradient(
  100deg,
  rgba(6,12,21,0.92) 0%,
  rgba(6,12,21,0.82) 34%,
  rgba(6,12,21,0.46) 62%,
  rgba(6,12,21,0.28) 100%
);
```

Type always lives in the 0–34% band. Imagery always breathes in the 62–100% band.

### Accent discipline — the 4% rule

`accent/signal` may occupy **no more than 4% of the frame's pixel area in any single frame**, and
must be **absent entirely from at least 3 of the 9 scene archetypes**. It is permitted only on:

1. The eyebrow rule (a 2px × 56px tick, not a filled bar).
2. Exactly **one** active node/path in an architecture diagram at a time — never two.
3. The signature Strata Wipe leading edge (2px).
4. The CTA underline and the logo mark accent.

Forbidden for accent: full-width bars, filled buttons, background washes, glows above
`0 0 24px rgba(198,161,91,0.22)`, text longer than 6 words, any gradient from amber to another hue.

### Absolutely excluded

`#00E5FF`, `#6EE7F9`, `#22D3EE`, `#8B5CF6`, `#A855F7` and every cyan/violet in that family.
No pure `#000000`. No pure `#FFFFFF`. No hue outside the navy–steel–amber triad — **the film
contains exactly three hue families and no others.**

---

## 3. Typography

### Stack (macOS-safe, zero network fonts)

```css
--font-display: "SF Pro Display", system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif;
--font-text:    "SF Pro Text", system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif;
--font-mono:    "SF Mono", ui-monospace, Menlo, Monaco, "Courier New", monospace;
```

Every fallback in every chain is present in `/System/Library/Fonts` on this machine and verified.
No `@font-face`, no `@remotion/google-fonts`, no `Inter` (not installed — the current renderer
requests it and silently falls through, which is why the draft looks generic).

**Weight constraint (hard):** use **300 / 400 / 500 / 700 only.** `HelveticaNeue.ttc` ships
UltraLight, Thin, Light, Regular, Medium, Bold — **there is no 600.** Requesting `font-weight: 600`
or `750` produces a synthesized face that renders differently in headless Chromium than in Studio.
The existing renderer's `fontWeight: 750` and `800` are bugs; do not repeat them.

**Mono is meaningful, not decorative.** `--font-mono` is reserved exclusively for machine-record
data: UEI, CAGE, NAICS codes, SAM.gov status, and diagram node labels. Setting the registrations
in mono makes them read as a *record*, not as marketing. Never set a headline in mono.

### Type scale — 1920×1080

| Role | Size | Weight | Tracking | Line-height | Case | Color |
|---|---|---|---|---|---|---|
| `display` (title/CTA only) | 108px | 500 | `-3.2px` (−0.030em) | `1.04` (112px) | Sentence | `fg/primary` |
| `headline` | 76px | 500 | `-2.0px` (−0.026em) | `1.10` (84px) | Sentence | `fg/primary` |
| `headline-sm` (3-line stmts) | 60px | 400 | `-1.3px` (−0.022em) | `1.16` (70px) | Sentence | `fg/primary` |
| `subhead` | 40px | 400 | `-0.6px` (−0.015em) | `1.32` (53px) | Sentence | `fg/secondary` |
| `body` | 30px | 400 | `-0.2px` (−0.007em) | `1.44` (43px) | Sentence | `fg/secondary` |
| `eyebrow` | 19px | 500 | `+3.4px` (+0.18em) | `1.0` (19px) | UPPERCASE | `accent/signal` |
| `label` (diagram/UI) | 22px | 500 | `+0.8px` (+0.036em) | `1.25` (28px) | Sentence | `fg/secondary` |
| `data` (mono) | 32px | 400 | `+0.4px` | `1.30` (42px) | As-recorded | `fg/primary` |
| `data-label` (mono) | 17px | 400 | `+1.9px` (+0.11em) | `1.0` | UPPERCASE | `fg/tertiary` @ 24px min — use `fg/secondary` `opacity .75` at 17px |
| `legal` | 18px | 400 | `+0.3px` | `1.40` (25px) | Sentence | `fg/secondary` @ `opacity .75` |

Additional invariants:
- `font-feature-settings: "tnum" 1, "ss01" 1;` on everything mono and numeric so codes don't jitter.
- `-webkit-font-smoothing: antialiased;` globally.
- **Never** `text-transform: uppercase` above 22px. Only eyebrows and data-labels are uppercase.
- **Never** italic. **Never** a text-shadow (use the scrim). **Never** a stroke/outline.
- Maximum 3 lines of headline, maximum 2 lines of subhead, per scene. If it doesn't fit, cut copy.
- Headline measure: max **1144px** (8 columns). Body measure: max **852px** (6 columns).

### Text entry / exit rule (single rule, whole film)

Type is **revealed by a mask, not flown in.** Nothing translates more than 22px, ever.

**ENTER** — per line, staggered:
- Wrapper `overflow: hidden` per line box.
- Inner line: `translateY: 22px → 0`, `opacity: 0 → 1`.
- Duration **14 frames**. Easing `cubic-bezier(0.16, 1, 0.3, 1)` (`Easing.bezier(0.16,1,0.3,1)`).
- Stagger **4 frames** per subsequent line. Eyebrow leads the headline by **6 frames**.
  Subhead/body follows the last headline line by **8 frames**.
- The eyebrow's 2px amber tick draws first: `scaleX: 0 → 1`, `transform-origin: left`, **9 frames**,
  same easing, starting 6 frames before the eyebrow text.

**EXIT** — whole block, no stagger:
- `opacity: 1 → 0` over **9 frames**, `translateY: 0 → -10px`,
  easing `cubic-bezier(0.55, 0, 1, 0.45)`.
- Exit begins at `durationInFrames - 12`.

**Never**: per-character typewriter, per-word pop, blur-in, scale-in from 0.8, rotation, bounce/
overshoot springs on type. Springs are banned on typography entirely — use the bezier above.

---

## 4. Motion language

**30fps. All values in frames.**

### 4.1 The single-axis rule

The camera has **one degree of freedom: depth (Z).** It pushes in or pulls out. It never pans
laterally, never tilts, never orbits, never handheld-shakes. Lateral information is delivered by
*layer parallax within* a push, never by moving the camera sideways. This is what makes 9 different
scene archetypes read as one film.

### 4.2 Camera-move simulation

**A. Slow push (default for all photographic plates and all diagram scenes)**
```
scale:      1.000 → 1.055   over the full scene duration
translateY: 0px   → -14px   (subject rises fractionally in frame)
easing:     Easing.bezier(0.37, 0, 0.63, 1)   // easeInOutSine, no perceptible start/stop
transform-origin: 50% 46%
```
Alternate direction scene-to-scene: push (1.000→1.055), then settle-out (1.055→1.010) on the next.
Never two identical moves back to back.

**B. Parallax drift (multi-plane scenes — plate + diagram overlay + type)**
Over the full scene duration, driven by the same easing:
```
plate/background layer:  scale 1.00 → 1.045,  translateY 0 → -6px,   translateX 0 → -4px
mid layer (grid/lines):  scale 1.00 → 1.020,  translateY 0 → -11px,  translateX 0 → +3px
type layer:              scale 1.00,          translateY 0 → -18px,  translateX 0
```
Type always moves most; background always moves least. Inverted parallax is a bug.

**C. Strata descent (the signature move — used 3× only)**
The frame's content scales up past the lens while the next stratum rises from below:
```
outgoing layer: scale 1.00 → 1.22, opacity 1 → 0, over 20 frames, Easing.bezier(0.7, 0, 0.84, 0)
incoming layer: scale 0.94 → 1.00, opacity 0 → 1, over 20 frames, Easing.bezier(0.16, 1, 0.3, 1)
                incoming starts at frame 6 of the outgoing move (14-frame overlap)
```

### 4.3 Transition vocabulary (exactly four; nothing else exists)

| # | Name | Frames | Where | Construction |
|---|---|---|---|---|
| T1 | **Hard cut** | 0 | Default. ~60% of all transitions. | Straight cut on a motion beat. Cut *into* movement, never into a static hold. |
| T2 | **Dip to deep** | 16 (8 out / 8 in) | Act boundaries only (3× total). | Cross-fade through `bg/deep #060C15` at 100%. Both halves `Easing.bezier(0.4,0,0.2,1)`. Hold pure `#060C15` for exactly 2 frames at the midpoint. |
| T3 | **Strata Wipe** (signature) | 18 | Entering an architecture/diagram scene (4× total). | A 2px `accent/signal` horizontal line travels top→bottom (y: −4px → 1084px) with `Easing.bezier(0.33,0,0.15,1)`. Content above the line is the incoming scene, below is outgoing (`clip-path: inset()` on both, driven by the same y). The line carries a 1-frame trailing smear: `box-shadow: 0 -6px 18px -6px rgba(198,161,91,0.35)`. Line opacity `0 → 1` in the first 3 frames, `1 → 0` in the last 3. |
| T4 | **Strata descent** | 20 | The 3 depth changes described in 4.2C. | As specified above. |

### 4.4 Easing library (define once, import everywhere)

```ts
export const E = {
  enter:  Easing.bezier(0.16, 1.00, 0.30, 1.00),  // expo-out — all reveals
  exit:   Easing.bezier(0.55, 0.00, 1.00, 0.45),  // quart-in — all dismissals
  camera: Easing.bezier(0.37, 0.00, 0.63, 1.00),  // sine-in-out — every camera move
  wipe:   Easing.bezier(0.33, 0.00, 0.15, 1.00),  // decisive, mechanical — T3 only
  descend:Easing.bezier(0.70, 0.00, 0.84, 0.00),  // expo-in — T4 outgoing only
};
```

**Springs are banned film-wide.** No `spring()`, no overshoot, no damping/stiffness anywhere.
Overshoot is the single loudest "template motion graphics" tell and it reads as unserious to this
audience.

### 4.5 Diagram / graphic element motion

- **Line draw:** `stroke-dasharray` reveal, **22 frames**, `E.enter`. Lines draw in reading order,
  stagger **5 frames**. Lines draw from source node toward destination node, never both ends.
- **Node appear:** `opacity 0→1` + `scale 0.96→1.00`, **11 frames**, `E.enter`, stagger **6 frames**.
- **Active-state pulse:** the single amber node breathes `opacity 0.72 → 1.00 → 0.72` on a
  **48-frame** loop, `E.camera`. Amplitude never exceeds that. No scale pulse, no ring/ripple.
- **Data-flow packets:** a 3px × 26px `accent/support` capsule traveling a drawn path, **34 frames**
  edge-to-edge, linear, max **3 packets on screen at once**, opacity `0 → 0.9 → 0` across the run.
- **Counter/number roll:** banned. Numbers cut in with the text reveal.

### 4.6 Rhythm map (1800 frames)

| Act | Frames | Time | Beat | Cutting |
|---|---|---|---|---|
| I — Surface | 0–420 | 0:00–14:00s | The mission is visible; the system underneath is not. | 3 scenes. ASL 140f. Slowest section — establishes authority. |
| II — Descent | 420–1140 | 14:00–38:00s | Engineers design it, architect it, build it, secure it. | 5–6 scenes. ASL 125f. Two Strata Wipes + two Strata Descents. |
| III — Assurance | 1140–1590 | 38:00–53:00s | Availability, integrity, recovery. Seven disciplines. The record. | 3–4 scenes. ASL 115f — tightest cutting in the film. |
| IV — Return | 1590–1800 | 53:00–60:00s | Rise back to surface. CTA. | 1–2 scenes. Single 210f hold on the lockup. |

Hard constraints:
- **Minimum scene length 72 frames (2.4s).** Nothing shorter — short scenes read as a sizzle reel.
- **Maximum scene length 240 frames (8.0s).**
- **Sound-off legibility:** every scene's primary message must be fully readable by **frame 45** of
  that scene, and must hold static for **≥40 frames** before exit begins.
- **No motion in the last 24 frames of the film.** The final lockup is dead still. Freeze is power.
- Cut density never increases in Act IV. The film decelerates into the CTA; it does not build to a
  montage climax.

---

## 5. Grade and finish

One `<Grade>` wrapper component sits above every scene in `VideoComposition` so all imagery —
regardless of which generator produced it — resolves to one film. Order matters: **grade → cast →
vignette → grain → edge.**

### 5.1 Contrast curve (SVG, applied to photographic layers only)

CSS `contrast()` is linear and crushes; use a real filmic S-curve with a lifted toe and cool
shadows / warm highlights.

```html
<svg width="0" height="0" style="position:absolute">
  <filter id="nistaGrade" colorInterpolationFilters="sRGB">
    <feComponentTransfer>
      <feFuncR type="table" tableValues="0.045 0.170 0.380 0.610 0.800 0.925 0.990"/>
      <feFuncG type="table" tableValues="0.040 0.160 0.370 0.600 0.790 0.920 0.985"/>
      <feFuncB type="table" tableValues="0.070 0.200 0.395 0.600 0.775 0.895 0.960"/>
    </feComponentTransfer>
    <feColorMatrix type="saturate" values="0.78"/>
  </filter>
</svg>
```

Applied as `filter: url(#nistaGrade)` on every `<Img>`/`<Video>` element.
Net effect: blacks lifted to ~4.5% (never crushed), shadows pushed blue, highlights pulled warm,
saturation down 22% so no generator's oversaturated output can break the palette.

### 5.2 Color cast (two stacked overlays, `pointer-events: none`)

```css
/* layer 1 — unify to navy */
.cast-navy {
  position: absolute; inset: 0;
  background: #0B1523;
  mix-blend-mode: color;
  opacity: 0.34;
}
/* layer 2 — warm highlight bias, keeps skin from going corpse-grey */
.cast-warm {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 55% at 52% 38%, rgba(198,161,91,0.16) 0%, rgba(198,161,91,0) 70%);
  mix-blend-mode: soft-light;
  opacity: 1;
}
```

### 5.3 Vignette

```css
.vignette {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 118% 104% at 50% 44%,
      rgba(6,12,21,0.00) 36%,
      rgba(6,12,21,0.22) 68%,
      rgba(6,12,21,0.58) 100%),
    linear-gradient(to bottom, rgba(6,12,21,0.30) 0%, rgba(6,12,21,0) 16%);
}
```

Anamorphic-ish ellipse (118% × 104%), centre lifted to 44% so the frame's weight sits low.
No hard-edged vignette, no square vignette, no vignette on pure motion-graphics scenes above
50% of these values.

### 5.4 Grain (animated — static grain is a dead giveaway)

```html
<svg width="0" height="0" style="position:absolute">
  <filter id="nistaGrain">
    <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2"
                  stitchTiles="stitch" seed={frame % 7} result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
  </filter>
</svg>
```
```css
.grain {
  position: absolute; inset: -2%;  /* overscan so filter edges never show */
  filter: url(#nistaGrain);
  opacity: 0.052;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```
`seed={frame % 7}` re-rolls the noise every frame on a 7-frame cycle — enough to read as film
grain, short enough to stay deterministic across re-renders. Opacity **0.052 on photographic
scenes, 0.034 on pure motion-graphics scenes.** Never above 0.06 (becomes visible noise, and
destroys LinkedIn's H.264 bitrate on the flat navy fields).

### 5.5 Edge treatment

- **No letterbox bars.** The film is 16:9 native; fake 2.39:1 bars on a LinkedIn feed video are the
  #1 stock-video tell and cost 22% of vertical real estate.
- No rounded frame corners, no inner border, no "film burn", no light leaks, no lens flares,
  no chromatic aberration, no bloom.
- A single global 1px inner edge is permitted: `box-shadow: inset 0 0 0 1px rgba(36,52,74,0.5)` —
  only on `bg/elevated` panels, never on the frame itself.

### 5.6 Generator normalisation (for asset-producer / prompt-engineer)

Every generated plate must be requested at **2304×1296 minimum** (20% overscan headroom for the
1.055 push) and must satisfy, before grade:
- Low-key exposure, key light from a single practical source, shadow detail retained.
- No visible faces in focus in the foreground (avoids uncanny generation and avoids implying
  identifiable government personnel). Figures are back-three-quarter, silhouetted, or out of focus.
- **No visible logos, agency seals, flags, badges, or screen text** — screen content is composited
  in post as motion graphics so it stays under our control and inside claim guardrails.
- No teal-and-orange grading, no lens flare, no volumetric god-rays, no glowing blue holograms.

---

## 6. Composition rules

### 6.1 Safe areas

| Zone | Value |
|---|---|
| Title safe (all primary type) | **96px** from every edge |
| Action safe (graphics may touch) | **56px** from every edge |
| Bottom reserve (LinkedIn chrome / caption bar) | **bottom 140px** — no critical type below `y = 940` |
| Top reserve | no critical type above `y = 96` |

### 6.2 Grid

12 columns · outer margin **96px** · gutter **24px** · **column width 122px** · usable width **1728px**.
Vertical baseline grid: **8px**. Every `y` value in the film is a multiple of 8.

Derived measures (use these literal numbers):
- 4 col = 512px · 5 col = 706px · 6 col = 852px · 7 col = 998px · 8 col = 1144px

### 6.3 Type placement

Two anchors only. Do not invent a third.

**Anchor A — "Low left" (all photographic plates, all statement cards)**
- Left edge `x = 96`. Text left-aligned. Ragged right, never justified.
- Block *bottom* baseline sits at `y = 856`. The block grows upward from there.
- Headline max width **1144px** (8 col); body max width **852px** (6 col).
- Imagery occupies the right/upper field; the plate's visual subject must fall between
  `x = 1100–1824` and `y = 120–700`. Brief the image prompts for **negative space in the lower-left
  third** — this is a hard requirement on every generated plate.

**Anchor B — "Optical centre" (title card, CTA lockup, assurance triad only)**
- Horizontally centred. Block *optical* centre at `y = 496` (48px above true centre — the eye reads
  geometric centre as low).
- Max block width **1144px**. Centred type is permitted **only** at these three moments; everywhere
  else centring is banned.

Diagram scenes: the diagram is centred on `x = 960`, occupies `y = 232–848` (616px tall), with the
scene's eyebrow at `x = 96, y = 152` and the caption strip at `x = 96, y = 904` — the diagram never
overlaps type.

### 6.4 Lower third / credential block

Used for the SAM.gov / UEI / CAGE / NAICS record. Constructed as a *record*, not a badge row.

```
Container:  x = 96, width = 1144 (8 col), bottom edge at y = 940
Fill:       #141F2E at opacity 0.94, backdrop-filter: blur(18px) saturate(0.9)
Top rule:   1px #2C3E56, full container width
Accent tick:2px × 56px #C6A15B, flush left, sitting ON the top rule, extending 12px above it
Padding:    32px top, 28px bottom, 32px left/right
```
Inside, a 4-column record table (each 254px wide, 24px gutter):
- Row 1: `data-label` — mono 17px, `+1.9px` tracking, uppercase, `#9DAABA` @ 0.75
  → `SAM.GOV` · `UEI` · `CAGE` · `CLASSIFICATION`
- Row 2 (8px below): `data` — mono 32px, `#F2EFE8`
  → `ACTIVE` · `YGRB3SMAWE6` · `22PQ4` · `SMALL BUSINESS`
- Optional row 3: NAICS as `legal` 18px `#9DAABA` @ 0.75, single line, mono:
  `NAICS 541511 · 541512 · 541519 · 518210 · 541715`

Entry: container height `0 → full` via `clip-path: inset(100% 0 0 0) → inset(0)` over **16 frames**,
`E.enter`; the four columns then reveal with the standard text rule, **4-frame** stagger.

### 6.5 Logo lockup

Bottom-right, baseline-aligned to the credential block. Cap height **44px**, right edge at
`x = 1824`, baseline at `y = 940`. On the CTA card only, the logo goes to Anchor B, cap height
**72px**, with a 2px × 96px `accent/signal` rule **32px beneath** it and the CTA line 40px below
that. The logo is never animated beyond the standard text reveal — no draw-on, no assembly, no spin.

---

## 7. Anti-pattern list

**Kill on sight in the current `src/video/SceneRenderer.tsx`** — every one of these is present and
every one of them must be removed:
1. `accent = '#6EE7F9'` cyan default and the `rgba(139,92,246,.15)` violet radial. → §2.
2. The scrolling 64px grid overlay (`translateY(frame*.25 % 64)`). Endless-grid = crypto ad.
3. The bottom progress bar. Progress bars belong in a product, not a brand film.
4. `spring({damping:18, stiffness:110})` on type. → §4.4, springs banned.
5. `fontWeight: 750 / 800`. → §3, 300/400/500/700 only.
6. `fontFamily: 'Inter,...'` — Inter is not installed on this machine; it silently falls to a
   default and is the reason the draft reads generic. → §3.
7. `background: index % 2 === 0 ? A : B` alternating-background logic. Backgrounds are chosen by
   scene archetype, never by parity.
8. `borderRadius: 28` + `boxShadow: 0 40px 120px` floating image cards. → §7.11.

**Never use these transitions (by name):** cross-zoom, whip-pan, glitch/RGB-split, light-leak wipe,
page curl, cube/3D flip, push/slide (the PowerPoint family), star/iris wipe, film-burn dissolve,
luma-ramp "smooth zoom" (the Premiere preset), speed-ramp with motion blur, letterbox-crash-in.
The film has exactly four transitions (§4.3). Any fifth is a defect.

**Never do these:**
9. Bullet points. Zero bullets in the film. If a list is unavoidable (the seven disciplines) it is
   a typographic grid with hairline rules, not a bulleted list.
10. Icon sets — no line-art shields, locks, clouds, gears, brains, or circuit-board motifs. A padlock
   icon next to the word "secure" is the visual equivalent of clip art.
11. Floating rounded-corner cards with heavy drop shadows drifting over a gradient. Panels are flat,
    1px-ruled, and locked to the grid.
12. Glowing translucent "holographic UI" panels, HUD reticles, scanning lines, radar sweeps,
    fingerprint scans, DNA helices, wireframe globes, world maps with arcing connection lines.
13. Particle fields, floating dots-and-lines "network" backgrounds, bokeh, nebulae, data rain.
14. Stock footage clichés: handshake, boardroom nodding, pointing at a monitor together, walking
    down a corridor toward camera in slow motion, drone shot of a glass HQ, someone typing with
    green code reflected in glasses, a Capitol dome / flag / eagle.
15. Timeline scrubs, counting-up numbers, animated bar/line charts, percentage rings.
16. Kinetic type that scales from 0, rotates, bounces, or types character-by-character.
17. Full-bleed text over ungraded, unscrimmed photography.
18. Fake UI screenshots containing invented dashboards, metrics, agency names, or alert counts —
    this violates the claim guardrails as well as the look. All screen content is abstract
    architecture, not a fictional product.
19. More than one accent colour on screen at once; any second "hot" hue.
20. Music-video cutting — more than 3 cuts inside any 4-second window.
21. Any transition longer than 20 frames. Long dissolves read as a corporate slideshow.
22. Emoji, checkmarks, star ratings, badge graphics, "As seen in" strips.

---

## 8. Scene-type inventory

Nine archetypes. Every scene in the storyboard must be one of these — no bespoke scenes.
`MG` = pure motion graphics (zero generation cost). `PHOTO` = generated still + our camera move.
`VIDEO` = generated video clip.

| # | Archetype | Visual construction | Asset need |
|---|---|---|---|
| **S1** | **Cinematic plate — institutional surface** | Full-bleed graded still of a low-key secure operations floor / agency interior at dusk. Slow push (§4.2A) + 100° scrim, Anchor A type in the lower-left negative space. Figures are silhouetted or out of focus, no faces, no seals, no screen text. | **PHOTO** (2304×1296). 3 plates total. |
| **S2** | **Statement card** | `bg/base` only. Amber eyebrow tick + eyebrow, then a 60–76px headline on Anchor A. Behind it, a barely-visible 96px hairline grid at `#24344A` @ 0.18 that does **not** scroll — it drifts −8px over the whole scene with the parallax rule. Nothing else. | **MG** |
| **S3** | **Strata descent** (signature) | The transitional scene, not just a transition: three stacked labelled strata (`INTERFACE` / `SERVICE` / `PLATFORM` / `SUBSTRATE`, mono labels) drawn as 1px-ruled horizontal bands on `bg/elevated`; camera drives *through* each band using T4. The amber Strata Wipe line is the through-line. | **MG** |
| **S4** | **Platform architecture diagram** | Centred isometric-adjacent (12° shear, not a full 3D iso — keeps it dimensional without looking like a cloud-vendor slide) node-and-path system on `bg/elevated`. Nodes are 1px `line/strong` rectangles with mono labels; exactly one active node in `accent/signal`; data packets in `accent/support` travel drawn paths. Entered via T3 Strata Wipe. Built once, re-posed 3× at different depths. | **MG** |
| **S5** | **Engineering vignette — the hands** | Tight, shallow-depth plate: hands at a mechanical keyboard, a whiteboard mid-derivation, a terminal reflected on a dark surface. This is the proof shot for "engineers, not intermediaries." Settle-out camera move (1.055→1.010). Type sits low-left, short — max 6 words. | **PHOTO** (2 plates) or **VIDEO** (max 2 clips, 3–4s each, only if a live micro-motion — steam, a hand moving, a screen refresh — materially outperforms the still). |
| **S6** | **Assurance triad** | Anchor B. Three equal columns (each 512px, 96px gutters) at `y = 380–700`, separated by 1px `line/hairline` verticals. Mono data-label above, 40px subhead below: **AVAILABILITY · INTEGRITY · RECOVERY**. Columns reveal L→R with 10-frame stagger; a single amber 2px underline sweeps beneath all three (`scaleX 0→1`, 26 frames) at the end. No icons. | **MG** |
| **S7** | **Discipline grid** | The seven government disciplines as a 4+3 typographic grid on `bg/base`. Each cell: 254px wide, mono index (`01`–`07`) in `fg/tertiary`, discipline name in 30px `fg/primary`, 1px top rule. Cells reveal in reading order, 5-frame stagger. Absolutely no icons, no cards, no colour coding. | **MG** |
| **S8** | **Credential block / the record** | Full spec in §6.4. Sits over a darkened S1 plate at 0.90 scrim, or over `bg/base`. Reads as a filed record. Mono throughout. This is the scene that converts a skeptical buyer — it must look like a document, not a badge. | **MG** (over an existing S1 plate — no new generation) |
| **S9** | **CTA lockup** | `bg/deep #060C15`. Anchor B. Logo at 72px cap height, 2px × 96px amber rule 32px below, then `Modernize with confidence.` at `display` 108px/500, then `nistatech.com` at `body` 30px in `fg/secondary` 56px beneath. Vignette at 50% strength, grain 0.034. Enters on T2 dip-to-deep. **Dead still for the final 24 frames.** | **MG** |

### Asset budget implication
7 of 9 archetypes are pure motion graphics. Generation is confined to **5 stills (S1×3, S5×2)** and
**at most 2 short video clips**, well inside `maxGeneratedVideoClips: 6` and `maxProjectSpend: 25`.
Per CLAUDE.md provider logic, S5 defaults to stills and only escalates to video if the motion is
load-bearing.

---

## 9. Acceptance checks (for video-qa)

A draft fails QA if any of these is true:
1. Any pixel matches a banned hue family (cyan `#00E5FF`–`#6EE7F9`, violet `#8B5CF6`–`#A855F7`).
2. `accent/signal` exceeds **4%** of frame area in any sampled frame.
3. Any type falls outside the 96px title-safe box, or any critical type below `y = 940`.
4. Any scene shorter than **72 frames** or longer than **240 frames**.
5. Any scene whose message is not fully legible by its **frame 45**.
6. Any transition not in the four-item set, or longer than **20 frames**.
7. Any `spring()` call, any `font-weight: 600`, any reference to `Inter`.
8. Any on-screen claim outside the brief's grounding list, or any SOC 2 / NIST reference not
   qualified as *readiness / in progress*.
9. Measured contrast of any text sample below **4.5:1** against its composited background.
10. Motion detected in the final **24 frames**.
