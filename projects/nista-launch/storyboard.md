# NISTA Technologies — Launch Film
## Storyboard (shot-by-shot production document)

**Project:** `nista-launch` · **Format:** 16:9, 1920×1080, 30fps · **Total:** 1800 frames / 60.000s
**Planned scenes:** 12 · **As-built scenes:** 11 · **Beats mapped:** 8/8
**Generated assets planned:** 3 required stills, 1 optional still, 1 optional clip · **actually generated:** 3 stills, 0 clips
**Status:** CONFORMED — §A below is the delivered cut and supersedes §1–§2 wherever they disagree.
**Governing documents:** `brief.md` (claim guardrails), `script.md` (narration + on-screen copy), `strategy.md` (art direction — binding; §8 archetypes, §7 anti-patterns).

---

## A. As-built conform record (authoritative)

§1 and §2 are the *plan*, written before narration existed and explicitly declaring its frame
numbers provisional (§0.1). This section is what was actually built, measured off the delivered
master. Where the two disagree, this section wins.

Scene durations were re-derived from the measured narration clips exactly as §0.1 prescribes, and
`audio-timing.json` is the authority for every boundary below.

| # | id | archetype | in | out | frames | beat | transition in | camera |
|---|---|---|---|---|---|---|---|---|
| 1 | `s01-hook` | cinematicPlate | 0 | 135 | 135 | b1 | cut (open) | push |
| 2 | `s02-problem` | statementCard | 135 | 344 | 209 | b2 | cut | settle |
| 3 | `s03-positioning` | architectureDiagram | 344 | 577 | 233 | b3 | strataWipe 18 | push |
| 4 | `s04-whiteboard` | engineeringVignette | 577 | 737 | 160 | b4a | cut | settle |
| 5 | `s05-keyboard` | engineeringVignette | 737 | 897 | 160 | b4b | strataDescent 20 | push |
| 6 | `s06-assurance` | assuranceTriad | 897 | 1004 | 107 | b5a | cut | settle |
| 7 | `s07-not-bolted-on` | statementCard | 1004 | 1165 | 161 | b5b | cut | push |
| 8 | `s08-secure` | statementCard | 1165 | 1275 | 110 | b6a | cut | settle |
| 9 | `s09-disciplines` | disciplineGrid | 1275 | 1457 | 182 | b6b | cut | push |
| 10 | `s10-record` | credentialBlock | 1457 | 1635 | 178 | b7 | strataDescent 20 | settle |
| 11 | `s11-cta` | ctaLockup | 1635 | 1800 | 165 | b8 | dipToDeep 18 | hold |

Sum = 1800. Min 107 / max 233, inside the 72–240 rule.

### A.1 Why 11 scenes and not the planned 12

The plan split beat 2 across `s02-fails-in-delivery` + `s03-the-distance`. Measured, beat 2 runs
209 frames — comfortably inside the 240-frame ceiling — so splitting it would have produced two
scenes around 100 frames each and cut away from a statement card before it had settled. It plays
as one card. Every other planned split survived contact with the measured audio.

### A.2 The beat-5 order correction

The first assembled cut played `Engineered in. / Not bolted on.` *before* the assurance triad.
The narration is the other way round — QA located the em-dash pause inside `vo/b5.wav` at
33.460–33.720s, so "Availability, integrity, and recovery" occupies 30.09–33.46s and "engineered
in… not bolted on" occupies 33.72–38.36s. The two cards were showing against each other's lines,
with the word "Recovery" arriving on screen 1.67s after it was spoken.

Corrected by swapping the two scenes **and** re-cutting the internal boundary to f1004
(33.4667s), which lands 7ms inside the measured pause. The junction is a hard cut rather than a
dip: a dip there re-opened a ~0.5s hole in a stretch that had already failed QA for a 1.43s blank
screen.

### A.3 Generated video: none

The plan allowed up to 2 clips and flagged one candidate (`clip-keyboard-microcut`) as a
*replacement* for the keyboard still, gated on whether live micro-motion outperformed the frozen
frame. It did not — the still carries the beat, and the strataDescent transition already supplies
motion through that pair. Per the brief's "generated video only for high-impact scenes" and
CLAUDE.md's provider preference order, the escalation was declined. 8 of 11 scenes are pure
motion graphics.

### A.4 Plates as delivered

| Plate | Scene | Model | Notes |
|---|---|---|---|
| `ops-floor.jpg` | s01 | cinematic_studio_2_5 | accepted first pass |
| `whiteboard.jpg` | s04 | nano_banana_pro | **v2** — v1 rejected: printed pseudo-branding on the marker barrel, a no-brandmark guardrail breach |
| `keyboard.jpg` | s05 | nano_banana_pro | **v2** — v1 rejected: display in frame (spec required it out of shot) and the arm crossed the lower-left type anchor |

All three delivered at 2304×1296 (Lanczos from 4K native), overscan headroom for the push.
Rejected originals retained under `public/assets/nista-launch/plates/`.

---

## 0. How to read this document

### 0.1 Frame numbers are a *proportion*, not a lock

Every start/duration/end frame below is the **intended proportion** of the film, derived from the
script's beat timecodes at the target read pace of 2.30 w/s. **Exact scene durations will be
re-derived from the measured length of each rendered narration clip** during the AUDIO → EDIT
handoff. When that happens:

1. Measure each beat's rendered VO clip. That gives the true beat span in frames.
2. Redistribute each beat's true span across its scenes using the **`Share of beat`** column in
   §1 — those ratios, not the absolute frames, are the creative intent.
3. Re-check the four hard constraints after redistribution: min **72f**, max **240f**,
   message legible by scene frame **45**, message static for **≥40f** before exit.
4. Absorb any residual drift in `s01` (hook pre-roll) and `s12` (CTA tail) only — never in
   `s10` (the seven-discipline scan) or `s11` (the credential record), whose dwell time is
   load-bearing.

The film total stays pinned at 1800 frames. If measured VO overruns, trim the hook pre-roll and
the CTA tail before touching any information frame.

### 0.2 Standing rules that apply to every scene

These resolve ambiguities in `strategy.md` that would otherwise be discovered at render time.

| # | Rule | Why |
|---|---|---|
| R1 | **The type layer never scales.** Camera scale (§4.2A/B) is applied to plate / diagram / grid layers only. Type moves on Y only, ≤22px, per §4.2B. | A 1.055 whole-frame push carries Anchor A's `x = 96` left edge to `x = 48.5` — outside the 96px title-safe box, an automatic §9.3 QA failure. Scaling only the imagery layers fixes this at zero creative cost. |
| R2 | Transition frames **overlap the cut**, they do not add runtime. T2 = 8f into the outgoing tail + 8f into the incoming head. T3/T4 straddle the cut across their full 18f/20f. Scene `start`/`duration`/`end` below are cut-to-cut and always sum to 1800. | Keeps the frame ledger exact. |
| R3 | `accent/signal #C6A15B` is **entirely absent** from archetypes **S1, S5 and S7** (scenes s01, s06, s07, s10). That satisfies §2's "absent from at least 3 of the 9 archetypes" and keeps the 4% area rule trivially true on the photographic plates. | §2 accent discipline. |
| R4 | Every photographic plate carries the §2 100° scrim, the §5 grade stack (grade → cast → vignette → grain), grain `0.052`. Pure motion-graphics scenes: grain `0.034`, vignette at ≤50% strength. | §5. |
| R5 | Text enter = 14f mask reveal, 4f stagger per line, eyebrow leads by 6f, amber tick draws 9f starting 6f before the eyebrow. Exit = 9f opacity + −10px, beginning at `duration − 12`. No springs, no per-character reveals. | §3 text rule. |
| R6 | Weights **300 / 400 / 500 / 700 only**. Fonts: SF Pro Display / SF Pro Text / SF Mono with the §3 fallback chains. **No `Inter`. No weight 600 or 750.** | §3, §7.5–7.6. |
| R7 | Mono (`SF Mono`) is used **only** for machine-record data and diagram/stratum node labels. Never a headline. | §3. |
| R8 | No scene contains a bullet, an icon, a rounded card, a glow above the §2 ceiling, a second hot hue, or any transition outside the four in §4.3. | §7. |

---

## 1. Scene ledger

| # | Scene id | Beat | Archetype | Start | Dur | End | Share of beat | Transition IN | Asset |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `s01-hook` | 1 | **S1** Cinematic plate | 0 | 180 | 180 | 100% | T2 (in-half, 8f) — film open | `generated-still` |
| 2 | `s02-fails-in-delivery` | 2 | **S2** Statement card | 180 | 126 | 306 | 46.7% | T1 hard cut (0f) | `motion-graphics` |
| 3 | `s03-the-distance` | 2 | **S3** Strata descent | 306 | 144 | 450 | 53.3% | T4 Strata descent (20f) | `motion-graphics` |
| 4 | `s04-nista-answers` | 3 | **S2** Statement card | 450 | 120 | 570 | 50.0% | T2 Dip to deep (16f) | `motion-graphics` |
| 5 | `s05-architecture-i` | 3 | **S4** Architecture diagram | 570 | 126 | 696 | 50.0% | T3 Strata Wipe (18f) | `motion-graphics` |
| 6 | `s06-engineers` | 4 | **S5** Engineering vignette | 696 | 150 | 846 | 51.0% | T1 hard cut (0f) | `generated-still` |
| 7 | `s07-scopes-ships` | 4 | **S5** Engineering vignette | 846 | 144 | 990 | 49.0% | T4 Strata descent (20f) | `generated-still` |
| 8 | `s08-architecture-ii` | 5 | **S4** Architecture diagram | 990 | 132 | 1122 | 48.9% | T3 Strata Wipe (18f) | `motion-graphics` |
| 9 | `s09-assurance-triad` | 5 | **S6** Assurance triad | 1122 | 138 | 1260 | 51.1% | T2 Dip to deep (16f) | `motion-graphics` |
| 10 | `s10-secure-by-design` | 6 | **S7** Discipline grid | 1260 | 240 | 1500 | 100% | T1 hard cut (0f) | `motion-graphics` |
| 11 | `s11-the-record` | 7 | **S8** Credential block | 1500 | 150 | 1650 | 100% | T4 Strata descent (20f) | `motion-graphics` |
| 12 | `s12-cta` | 8 | **S9** CTA lockup | 1650 | 150 | 1800 | 100% | T2 Dip to deep (16f) | `motion-graphics` |

**Contiguity check:** every `end` equals the next `start`. **Sum of durations = 1800.** Verified in §6.

### 1.1 Act structure

| Act | Scenes | Frames | Time | Scenes | ASL |
|---|---|---|---|---|---|
| I — Surface | s01–s03 | 0–450 | 0:00–0:15 | 3 | 150f |
| II — Descent | s04–s08 | 450–1122 | 0:15–0:37.4 | 5 | 134f |
| III — Assurance | s09–s11 | 1122–1650 | 0:37.4–0:55 | 3 | 176f |
| IV — Return | s12 | 1650–1800 | 0:55–1:00 | 1 | 150f |

**Documented deviations from the §4.6 rhythm map** (raised for creative-director sign-off):

- Act boundaries are pulled to the nearest **narration beat boundary** rather than the map's round
  numbers (450 vs 420; 1122 vs 1140; 1650 vs 1590). Cutting an act inside a spoken sentence is a
  worse defect than a 30-frame drift, and §4.6's spans were explicitly approximate.
- **Act II ends at s08, not at beat 5.** Act II is "Descent"; it ends at the deepest point in the
  film — the substrate architecture pose — and Act III opens on the assurance triad. This puts the
  T2 dip-to-deep exactly on the film's bottom-of-descent turn, which is what a dip is for.
- **Act III ASL is 176f, not 115f.** Act III contains the film's two information frames — the
  seven-discipline grid and the credential record. Both are *scanned*, not *watched*, by a sound-off
  viewer. Cutting them faster to hit an ASL target would destroy the only two frames that carry
  provable content. The tight-cutting intent is honoured instead by making both of Act III's
  internal transitions hard cuts (zero-frame), so the *cutting* is hard even though the *dwell* is long.
- **Act IV is 150f, not 210f.** The script mandates the credential card be held a full 5s; that 150f
  went to `s11`. The CTA still gets 150f — five seconds on a four-element lockup — and is dead still
  for its final 24 frames per §4.6.

### 1.2 Scene-count discipline

12 scenes for 60 seconds. Four beats (2, 3, 4, 5) exceed the 240-frame maximum scene length and
therefore *must* split into two scenes each; beats 1, 6, 7 and 8 each fit one scene. 1 + 2 + 2 + 2 +
2 + 1 + 1 + 1 = **12**, which is the floor, not a choice. No beat was split for variety's sake.

---

## 2. Scene detail

---

### `s01-hook`

| | |
|---|---|
| **Beat** | 1 — HOOK · "Some software is allowed to fail quietly. The systems you run are not." |
| **Archetype** | **S1** — Cinematic plate, institutional surface |
| **Frames** | start **0** · duration **180** · end **180** (0:00.000 – 0:06.000) |
| **Asset** | `generated-still` → `plate-ops-floor` |

**Visual construction (back to front):**
1. `bg/deep #060C15` base fill (visible only during the 8-frame open).
2. **Plate layer** — `plate-ops-floor`, full-bleed, 2304×1296 downscaled to 1920×1080 with 20% overscan headroom. A low-key secure operations floor at dusk. One back-three-quarter silhouetted figure at a console in the right field; every display in frame is dark or defocused past resolution. Filter `url(#nistaGrade)`.
3. **Cast layer** — `.cast-navy` (0.34, `mix-blend-mode: color`) then `.cast-warm` radial soft-light.
4. **Scrim layer** — the §2 standard 100° gradient. Type sits in the 0–34% band; the figure and the room breathe in the 62–100% band.
5. **Vignette** — §5.3 at full strength.
6. **Type layer** — Anchor A. No eyebrow, no amber tick (R3: S1 is accent-free; and per the script's intent, *no logo, no name yet — earn the next five seconds first*).
7. **Grain** — §5.4, opacity `0.052`, `seed = frame % 7`.

**On-screen type:**
```
Your systems cannot
fail quietly.
```
- Step: **`headline`** — 76px / 500 / `-2.0px` / `1.10` (84px) / `fg/primary #F2EFE8`.
- Set on two lines deliberately: at 76px the single-line measure is ≈1250px, over the 1144px (8-col) headline maximum.
- Anchor A: `x = 96`, left-aligned, ragged right, block **bottom baseline at `y = 856`** → lines occupy y ≈ 688–856.

**Camera:** **Push in.** Plate layer `scale 1.000 → 1.055`, `translateY 0 → -14px`, `transform-origin: 50% 46%`, `E.camera` across the full 180 frames. Type layer per R1: `scale 1.000`, `translateY 0 → -18px`.

**Motion:** f0–8 open (see transition). f8–22 held frame, no type — this is the script's 0.75s pre-roll before VO enters. f22 headline line 1 enters (14f mask reveal), f26 line 2 enters. Fully legible by **f40**. Static f40–168. Exit f168–177.

**Transition IN:** **T2 — Dip to deep, in-half only, 8 frames.** There is no outgoing scene, so only the second half of T2 runs: `#060C15` at 100% cross-fading to the graded plate over 8 frames, `E.bezier(0.4,0,0.2,1)`. This is the film opening from black, expressed inside the four-transition vocabulary. It does **not** consume one of the three permitted full T2 uses (§5 ledger).

**Edit note:** the cut out of this scene lands on the VO's word "not" — cut into the push's motion, never into a hold (§4.3 T1).

---

### `s02-fails-in-delivery`

| | |
|---|---|
| **Beat** | 2 — PROBLEM · "Modernization rarely fails at the whiteboard. It fails in the distance between those who plan and those who build." (first half) |
| **Archetype** | **S2** — Statement card |
| **Frames** | start **180** · duration **126** · end **306** (0:06.000 – 0:10.200) |
| **Asset** | `motion-graphics` |

**Visual construction (back to front):**
1. `bg/base #0B1523` flat fill. Nothing else behind it.
2. **Hairline grid layer** — 96px square grid, 1px `line/hairline #24344A` at `opacity 0.18`. **It does not scroll** (§7.2 kill). It drifts `-8px` on Y across the whole scene under the parallax rule and stops.
3. **Type layer** — Anchor A, amber eyebrow tick + eyebrow + headline.
4. **Vignette** at 50% of §5.3 values (motion-graphics scene). **Grain 0.034.**

**On-screen type:**
```
▍THE FAILURE MODE

Modernization fails
in delivery.
```
- Eyebrow tick: 2px × 56px `accent/signal #C6A15B`, `x = 96`, sitting 24px above the eyebrow baseline. Drawn `scaleX 0 → 1`, origin left, 9 frames.
- `THE FAILURE MODE` — step **`eyebrow`**: 19px / 500 / `+3.4px` / uppercase / `accent/signal`.
- Headline — step **`headline`**: 76px / 500 / `-2.0px` / `1.10` / `fg/primary`. Two lines (single-line measure ≈1150px, marginally over the 1144px maximum — do not risk it).
- Anchor A: `x = 96`, block bottom baseline `y = 856`.
- Accent area: tick (112px²) + eyebrow glyphs ≈ **0.09%** of frame. Far inside the 4% ceiling.

**Camera:** **Settle-out.** Grid layer `scale 1.055 → 1.010`, `translateY 0 → -14px`, `E.camera`, full 126 frames. (Alternates against s01's push per §4.2A.) Type layer `scale 1.000`, `translateY 0 → -12px`.

**Motion:** f0–9 amber tick draws. f6–20 eyebrow reveals. f12–26 headline line 1, f16–30 line 2. Legible by **f30**. Static f30–114. Exit f114–123.

**Transition IN:** **T1 — Hard cut, 0 frames.** Cut on the VO downbeat of "Modernization", straight from the moving plate into the settling grid — motion into motion.

---

### `s03-the-distance`

| | |
|---|---|
| **Beat** | 2 — PROBLEM · "…the distance between those who plan and those who build." (second half) |
| **Archetype** | **S3** — Strata descent (the signature scene, not just a transition) |
| **Frames** | start **306** · duration **144** · end **450** (0:10.200 – 0:15.000) |
| **Asset** | `motion-graphics` |

**Visual construction (back to front):**
1. `bg/elevated #141F2E` field.
2. **Stratum bands** — four full-width horizontal bands, each separated by a 1px `line/strong #2C3E56` rule, each with a left-flush mono label at `x = 96`:
   `INTERFACE` · `SERVICE` · `PLATFORM` · `SUBSTRATE`.
   Bands 1–2 are one grouped mass (the *plan* side); bands 3–4 are a second grouped mass (the *build* side).
3. **The distance** — the void between band 2 and band 3 **opens** from 8px to 96px across the scene. It is filled with `bg/deep #060C15`, and it is the only element in the film that grows. That gap is the scene's whole argument.
4. **Amber through-line** — a 2px `accent/signal` horizontal rule that descends with the camera; it travels bands 1→2, then **stops at the edge of the void and does not cross it**. Trailing smear `box-shadow: 0 -6px 18px -6px rgba(198,161,91,0.35)`.
5. **Caption strip** — `x = 96, y = 904` (§6.3 diagram-scene caption position).
6. Vignette 50%, grain `0.034`.

**On-screen type:**
- Stratum labels — step **`label`**, but set in **`--font-mono`** per R7: 22px / 500 / `+0.8px` / `fg/secondary #9DAABA`. Four labels, one per band, left flush at `x = 96`.
- Caption — step **`body`**: 30px / 400 / `-0.2px` / `fg/secondary`, single line, max measure 852px:
  ```
  The distance between plan and build.
  ```
- No headline. Beat 2's headline was delivered in s02; repeating it here would halve the information rate.

**Camera:** **Push, driven as descent.** This scene's camera *is* the §4.2C move, run twice internally:
- f0–20: `INTERFACE` band `scale 1.00 → 1.22`, `opacity 1 → 0`, `E.descend`; `SERVICE` band `scale 0.94 → 1.00`, `opacity 0 → 1`, `E.enter`, starting f6.
- f56–76: same move again, `SERVICE` out / `PLATFORM`+`SUBSTRATE` mass in.
- f76–144: the descent **stops**. Camera settles `scale 1.000 → 1.012` while the void opens. Nothing accelerates (§1).

**Motion:** f0–76 the two internal descents. f60–96 the void opens 8px → 96px, `E.camera`. f78–92 caption reveals. Amber through-line arrives at the void edge at f88 and holds. Legible by **f45** (the stratum labels and the first descent are complete and readable well before it). Static f96–132. Exit f132–141.

**Transition IN:** **T4 — Strata descent, 20 frames.** [T4 use 1 of 3.] `s02`'s grid + type layer `scale 1.00 → 1.22`, `opacity 1 → 0`, `E.descend`; `s03`'s band stack `scale 0.94 → 1.00`, `opacity 0 → 1`, `E.enter`, entering at frame 6 of the outgoing move (14-frame overlap). The scene's own first internal descent continues the same gesture without a seam.

---

### `s04-nista-answers`

| | |
|---|---|
| **Beat** | 3 — POSITIONING · "NISTA Technologies exists to close that distance. We don't just describe technology — we design it, and we build it." (first half) |
| **Archetype** | **S2** — Statement card |
| **Frames** | start **450** · duration **120** · end **570** (0:15.000 – 0:19.000) |
| **Asset** | `motion-graphics` |

**Visual construction (back to front):**
1. `bg/base #0B1523`.
2. **Hairline grid layer** — as s02, 96px, `#24344A` @ 0.18, `-8px` drift, non-scrolling. **Plus one addition:** the void from s03 resolves here as a single 1px `line/strong` horizontal rule at `y = 620` that **closes** — it draws in from both ends toward `x = 960` over 22 frames. The gap that opened in s03 is sealed on the words "close that distance."
3. **Type layer** — Anchor A, amber tick + eyebrow + headline. This is the film's brand entry: the company is named for the first time at 0:15, exactly one quarter of the way in, and only after the problem has been fully stated.
4. Vignette 50%, grain `0.034`.

**On-screen type:**
```
▍NISTA TECHNOLOGIES

We design it. We build it.
```
- Eyebrow tick: 2px × 56px `accent/signal`, `x = 96`.
- `NISTA TECHNOLOGIES` — step **`eyebrow`**: 19px / 500 / `+3.4px` / uppercase / `accent/signal`.
- Headline — step **`headline`**: 76px / 500 / `-2.0px` / `fg/primary`. **One line** (≈950px, inside the 1144px measure).
- Anchor A: `x = 96`, block bottom baseline `y = 856`.

**Camera:** **Push in.** Grid layer `scale 1.000 → 1.055`, `translateY 0 → -14px`, `E.camera`. Type layer `scale 1.000`, `translateY 0 → -12px`.

**Motion:** f0–9 tick draws. f6–20 eyebrow. f12–26 headline. f14–36 the `y = 620` rule closes toward centre. Legible by **f26**. Static f36–108. Exit f108–117.

**Transition IN:** **T2 — Dip to deep, 16 frames** (8 out / 8 in), holding pure `#060C15` for exactly 2 frames at the midpoint. **[T2 use 1 of 3 — Act I → Act II boundary.]** The film goes fully to black between the problem and the company's name. That two-frame black is the most valuable pause in the edit; do not shorten it.

---

### `s05-architecture-i`

| | |
|---|---|
| **Beat** | 3 — POSITIONING · "…we design it, and we build it." (second half) |
| **Archetype** | **S4** — Platform architecture diagram, **pose 1 of 2 (interface / service depth)** |
| **Frames** | start **570** · duration **126** · end **696** (0:19.000 – 0:23.200) |
| **Asset** | `motion-graphics` |

**Visual construction (back to front):**
1. `bg/elevated #141F2E`, with the single permitted `box-shadow: inset 0 0 0 1px rgba(36,52,74,0.5)` edge on the panel (§5.5).
2. **Diagram layer** — centred on `x = 960`, occupying `y = 232–848` (616px). Isometric-adjacent: a **12° shear only**, not a full 3D isometric (§8 S4 — this is what keeps it off a cloud-vendor slide).
   - **Nodes:** 1px `line/strong #2C3E56` rectangles, flat fill `bg/raised #1B2938`, mono labels inside. Six nodes at this depth, all abstract architecture, zero invented product surface (§7.18):
     `CLIENT` · `EDGE` · `API` · `SERVICE` · `QUEUE` · `STORE`
   - **Paths:** 1px `accent/support #5B8AB4` connectors, drawn `stroke-dasharray` from source node toward destination, 22 frames each, 5-frame stagger, reading order.
   - **Active node:** exactly **one** — `SERVICE` — filled `accent/signal #C6A15B` at 1px stroke plus label; breathing `opacity 0.72 → 1.00 → 0.72` on a 48-frame loop, `E.camera`. No ring, no ripple, no scale pulse.
   - **Data packets:** 3px × 26px `accent/support` capsules travelling drawn paths, 34 frames edge to edge, linear, **max 3 on screen at once**, `opacity 0 → 0.9 → 0`.
3. **Eyebrow** at `x = 96, y = 152` (§6.3 diagram rule). **Caption strip** at `x = 96, y = 904`. The diagram never overlaps type.
4. Vignette 50%, grain `0.034`.

**On-screen type:**
- `▍ARCHITECTURE` — step **`eyebrow`**: 19px / 500 / `+3.4px` / uppercase / `accent/signal`, with the 2px × 56px tick at `x = 96`.
- Node labels — step **`label`** in `--font-mono`: 22px / 500 / `+0.8px` / `fg/secondary`. `font-feature-settings: "tnum" 1, "ss01" 1`.
- Caption — step **`body`**: 30px / 400 / `fg/secondary`:
  ```
  Designed, architected, delivered.
  ```
  (Verbatim from the verified site language in `brief.md`. No claim exposure.)

**Camera:** **Settle-out.** Diagram layer `scale 1.055 → 1.010`, `translateY 0 → -14px`, `E.camera`. Type layers hold `scale 1.000` per R1.

**Motion:** f0–18 the wipe delivers the panel (see transition). f6–39 nodes appear (`opacity 0→1` + `scale 0.96→1.00`, 11f, 6f stagger). f18–62 paths draw. f40 `SERVICE` goes amber and begins its 48-frame breath. f44–78 first packet run. Caption enters f52–66. Eyebrow legible by **f20**, diagram readable by **f45**. Static f78–114 (packets and the amber breath continue — these are the sanctioned living elements, not layout motion). Exit f114–123.

**Transition IN:** **T3 — Strata Wipe, 18 frames.** [T3 use 1 of 2.] A 2px `accent/signal` line travels `y: -4px → 1084px` with `E.wipe`. Content above the line is `s05`, below is `s04`, both driven by `clip-path: inset()` off the same y. Line `opacity 0 → 1` over the first 3 frames and `1 → 0` over the last 3, carrying the 1-frame trailing smear `box-shadow: 0 -6px 18px -6px rgba(198,161,91,0.35)`.

---

### `s06-engineers`

| | |
|---|---|
| **Beat** | 4 — PROOF I · "Every engagement is designed, architected, and delivered by engineers — not staffed by intermediaries." |
| **Archetype** | **S5** — Engineering vignette, the hands |
| **Frames** | start **696** · duration **150** · end **846** (0:23.200 – 0:28.200) |
| **Asset** | `generated-still` → `plate-whiteboard` |

**Visual construction (back to front):**
1. `bg/deep #060C15`.
2. **Plate layer** — `plate-whiteboard`, full-bleed, graded. Tight, shallow depth of field: a hand mid-derivation at a wall-mounted writing surface, marker in motion-blur-free contact with the surface. The notation on the wall is **abstract structural drawing only** — tiers, boxes, arrows, a stack — with **no legible words, no acronyms, no numerals that could read as a metric**. Single practical key light from frame right. No face anywhere in frame.
3. Cast layers, §2 scrim (100°, type in the 0–34% band), vignette full, grain `0.052`.
4. **Type layer** — Anchor A. **No eyebrow, no amber** (R3). This is the film's human-proof beat and it earns its authority by being the plainest frame in it.

**On-screen type:**
```
Engineers.
Not intermediaries.
```
- Step: **`headline`** — 76px / 500 / `-2.0px` / `1.10` (84px) / `fg/primary`.
- Two lines. The line break *is* the argument — "Engineers." lands alone, and "Not intermediaries." lands as a refusal.
- Anchor A: `x = 96`, block bottom baseline `y = 856`.

**Camera:** **Push in.** Plate layer `scale 1.000 → 1.055`, `translateY 0 → -14px`, `E.camera`. Type layer `scale 1.000`, `translateY 0 → -18px`.

**Motion:** f0 hard cut in, already moving. f10–24 line 1 reveals, f14–28 line 2. Legible by **f28**. Static f28–138. Exit f138–147. Nothing else moves in this scene — no packets, no pulses, no accent. Deliberate.

**Transition IN:** **T1 — Hard cut, 0 frames.** Cut from the settling diagram straight to the hand. The abstraction ends and a person appears; a dissolve would soften exactly the moment that needs to be blunt.

---

### `s07-scopes-ships`

| | |
|---|---|
| **Beat** | 4 — PROOF I · "The engineer who scopes it is the engineer who ships it." |
| **Archetype** | **S5** — Engineering vignette, the hands (second plate) |
| **Frames** | start **846** · duration **144** · end **990** (0:28.200 – 0:33.000) |
| **Asset** | `generated-still` → `plate-keyboard` |

**Visual construction (back to front):**
1. `bg/deep #060C15`.
2. **Plate layer** — `plate-keyboard`, full-bleed, graded. Hands at a mechanical keyboard on a dark desk; a terminal's glow falls across the desk surface and the key caps, but the screen itself is **out of frame or defocused past any possible text resolution** (§5.6 and the claim guardrails — no readable screen text, ever). Same low-key single-source lighting as `plate-whiteboard` so the two plates read as one room, one person, one continuous act of work.
3. Cast, scrim, vignette, grain `0.052`.
4. **Type layer** — Anchor A. No eyebrow, no amber (R3).

**On-screen type:**
```
Scopes it. Ships it.
```
- Step: **`headline-sm`** — 60px / 400 / `-1.3px` / `1.16` (70px) / `fg/primary`. One line.
- Deliberately a step *down* from s06's 76px `headline`: this line is grammatically and logically subordinate to "Engineers. Not intermediaries." The type scale carries that subordination so the viewer does not read two competing claims.
- Anchor A: `x = 96`, block bottom baseline `y = 856`.

**Camera:** **Settle-out.** Plate layer `scale 1.055 → 1.010`, `translateY 0 → -14px`, `E.camera`. The T4 descent lands hot at 1.055 and this move decelerates out of it — the strata drop arrives and comes to rest. Type layer `scale 1.000`, `translateY 0 → -18px`.

**Motion:** f0–20 the descent resolves (see transition). f22–36 the line reveals. Legible by **f36**. Static f36–132. Exit f132–141.

**Transition IN:** **T4 — Strata descent, 20 frames.** [T4 use 2 of 3.] `s06` (whiteboard / the design stratum) `scale 1.00 → 1.22`, `opacity 1 → 0`, `E.descend`; `s07` (keyboard / the build stratum) `scale 0.94 → 1.00`, `opacity 0 → 1`, `E.enter`, entering at frame 6 of the outgoing move. **This is the most load-bearing transition in the film:** the descent from design to build happens *without a cut to a different person or place*, which is the literal visual form of "the engineer who scopes it is the engineer who ships it."

**Edit note:** `script.md` directs a 0.5s VO pause after "intermediaries." Land the *start* of this 20-frame descent inside that pause so the picture moves while the voice is silent.

---

### `s08-architecture-ii`

| | |
|---|---|
| **Beat** | 5 — PROOF II · "Availability, integrity, and recovery are first-class requirements — engineered in at the first architecture review, not bolted on before launch." (first half) |
| **Archetype** | **S4** — Platform architecture diagram, **pose 2 of 2 (substrate depth)** |
| **Frames** | start **990** · duration **132** · end **1122** (0:33.000 – 0:37.400) |
| **Asset** | `motion-graphics` |

**Visual construction (back to front):**
1. `bg/elevated #141F2E` with the §5.5 1px inset edge.
2. **Diagram layer** — the *same* node-and-path system as `s05`, **re-posed at the substrate depth**: the same 12° shear, but the camera is now beneath the service tier, so the top nodes are cropped by the frame edge and the previously unseen lower tier is fully revealed. Six nodes:
   `STATE` · `REPLICA` · `POLICY` · `LEDGER` · `RESTORE` · `SUBSTRATE`
   - Paths: 1px `accent/support`, `stroke-dasharray` draw, 22f, 5f stagger.
   - **Active node:** exactly one — `RESTORE` — in `accent/signal`, 48-frame breath. (In `s05` the active node was `SERVICE`, at the visible tier; here it is `RESTORE`, at the invisible one. The migration of the single amber node downward across the film is the accent's only narrative job.)
   - Packets: max 3, `accent/support`, 34f edge to edge.
   - **New element permitted here only:** a 1px `line/hairline` bracket spanning the three lowest nodes, labelled in mono — this is the "engineered in at the first review" bracket. It draws in 22 frames.
3. Eyebrow at `x = 96, y = 152`; caption strip at `x = 96, y = 904`.
4. Vignette 50%, grain `0.034`.

**On-screen type:**
- `▍SUBSTRATE` — step **`eyebrow`**: 19px / 500 / `+3.4px` / uppercase / `accent/signal`, 2px × 56px tick at `x = 96`.
- Node labels + bracket label — step **`label`** in `--font-mono`: 22px / 500 / `+0.8px` / `fg/secondary`.
- Caption — step **`body`**: 30px / 400 / `fg/secondary`:
  ```
  Engineered in at the first review.
  ```

**Camera:** **Push in.** Diagram layer `scale 1.000 → 1.055`, `translateY 0 → -14px`, `E.camera`. (Alternates against s07's settle-out.)

**Motion:** f0–18 wipe delivers the panel. f6–39 nodes appear. f18–62 paths draw. f40–62 the bracket draws. f44 `RESTORE` goes amber and begins its breath. Caption f52–66. Legible by **f45**. Static f66–120. Exit f120–129.

**Transition IN:** **T3 — Strata Wipe, 18 frames.** [T3 use 2 of 2.] Identical construction to `s05`'s wipe. The amber line descending through the frame is what carries the viewer from the human surface (`s07`) down to the substrate — the film's deepest point.

---

### `s09-assurance-triad`

| | |
|---|---|
| **Beat** | 5 — PROOF II · "…not bolted on before launch. Never afterthoughts." (second half) |
| **Archetype** | **S6** — Assurance triad |
| **Frames** | start **1122** · duration **138** · end **1260** (0:37.400 – 0:42.000) |
| **Asset** | `motion-graphics` |

**Visual construction (back to front):**
1. `bg/base #0B1523`. No grid — this scene is the flattest, quietest field in the film.
2. **Triad layer** — Anchor B, three equal columns of **512px** (4 grid columns each) with **96px gutters**, occupying `y = 380–700`. Total block width 512×3 + 96×2 = **1728px**, i.e. exactly the usable width, centred on `x = 960`. Column left edges: `x = 96`, `704`, `1312`.
3. **Separators** — 1px `line/hairline #24344A` verticals in the two gutters, `y = 380–700`, centred in each gutter.
4. **Amber underline** — a single 2px `accent/signal` rule at `y = 724`, spanning `x = 96 → 1824`, revealed `scaleX 0 → 1` from `transform-origin: left` over **26 frames**. Area ≈ 3456px² = **0.17%** of frame. Well inside the 4% rule.
5. **No icons.** (§8 S6, §7.10.)
6. Vignette 50%, grain `0.034`.

**On-screen type:**
| Column | data-label (above) | subhead (below) |
|---|---|---|
| 1 | `01` | Availability |
| 2 | `02` | Integrity |
| 3 | `03` | Recovery |

- data-labels — step **`data-label`** in `--font-mono`: 17px / 400 / `+1.9px` / uppercase / `fg/secondary #9DAABA` at `opacity 0.75` (never `fg/tertiary` at this size — §2 contrast rule). Baseline `y = 420`.
- Triad words — step **`subhead`**: 40px / 400 / `-0.6px` / `1.32` / **`fg/primary #F2EFE8`** (lifted from the `subhead` default of `fg/secondary`: these three words are the message, not a subordinate line — 14.45:1 contrast, unimpeachable). Baseline `y = 508`. Widest word "Availability" ≈ 290px, comfortably inside the 512px column.
- Closing line — step **`label`**: 22px / 500 / `+0.8px` / `fg/secondary`, centred within the Anchor B block, baseline `y = 780`:
  ```
  First-class requirements. Never afterthoughts.
  ```
- **Anchor B is permitted here.** §6.3 allows centred type at exactly three moments: the title card, the CTA lockup, and the assurance triad. This is one of them. Block optical centre `y = 496`.

**Escalation note for visual-director:** 40px is the §8-specified size. If LinkedIn feed-size testing shows the triad words are not scannable, step them to **`headline-sm` 60px** (widest word ≈435px, still inside the 512px column) — that is the only sanctioned deviation, and it must be applied to all three columns.

**Camera:** **Settle-out**, applied as §4.2B parallax with the type layer pinned. There is no background plate, so: separator + underline layer `scale 1.008 → 1.000`, `translateY 0 → -6px`. Type layer `scale 1.000`, `translateY 0 → -18px`. This is the least camera movement in the film so far — correct for the beat where the film states its engineering posture.

**Motion:** f0–14 column 1 (data-label then subhead, standard 14f reveal). f10–24 column 2. f20–34 column 3 (10-frame stagger L→R per §8 S6). Legible by **f34**. f70–84 the closing line reveals. Static f84–88. **f88–114 the amber underline sweeps** `scaleX 0 → 1`, 26 frames, `E.enter` — placed *at the end* per §8 S6, timed to land its full extent on the VO's "Never afterthoughts." Static f114–126. Exit f126–135.

> **Rule-conflict note (resolved, for video-qa):** §4.6 requires the message to hold static ≥40 frames before exit. The triad words themselves are static from **f34 to f126 — 92 frames**. The only thing moving in the f88–114 window is a 2px accent rule, not the message. §4.6's subject is the scene's message, so this scene passes. Do **not** re-time the sweep earlier; its landing on "Never afterthoughts" is the beat.

**Transition IN:** **T2 — Dip to deep, 16 frames** (8/8, 2 frames of pure `#060C15` at midpoint). **[T2 use 2 of 3 — Act II → Act III boundary.]** This is the bottom of the descent. The film goes black at its deepest point and comes up on the three words that justify the whole journey.

---

### `s10-secure-by-design`

| | |
|---|---|
| **Beat** | 6 — TRANSITION (SCOPE & SECURITY) · "Zero-trust posture. Hardened defaults. Secure development lifecycle — across seven engineering disciplines, from artificial intelligence to cloud and cybersecurity." |
| **Archetype** | **S7** — Discipline grid |
| **Frames** | start **1260** · duration **240** · end **1500** (0:42.000 – 0:50.000) |
| **Asset** | `motion-graphics` |

**Visual construction (back to front):**
1. `bg/base #0B1523`.
2. **Hairline grid layer** — 96px, `#24344A` @ 0.18, `-8px` drift, non-scrolling.
3. **Discipline grid layer** — the seven disciplines as a **4 + 3 typographic grid**, upper field, on the 12-column system:
   - **Cell width 414px** = 3 grid columns (3 × 122 + 2 × 24). Gutter 24px. Four cells + three gutters = 4 × 414 + 3 × 24 = **1728px** = exactly the usable width, `x = 96 → 1824`.
   - Cell left edges: `x = 96`, `534`, `972`, `1410`.
   - Row 1 top rule `y = 232`, cell body `y = 232–380`. Row 2 top rule `y = 404`, cell body `y = 404–552`. Row 2 has **three** cells; the fourth slot (`x = 1410`) is **deliberately empty** — an asymmetric 4+3 grid with an open corner, not a centred 7-across compromise.
   - Each cell: 1px `line/hairline #24344A` **top rule** at full cell width; mono index; discipline name below.
   - **No icons, no cards, no colour coding, no bullets** (§8 S7, §7.9, §7.10).
4. **Type layer** — Anchor A headline in the lower-left, below the grid. Grid occupies the upper field, type occupies the lower-left — consistent with the Anchor A field split.
5. **No amber anywhere in this scene** (R3 — S7 is one of the three accent-free archetypes).
6. Vignette 50%, grain `0.034`.

> **Documented deviation from §8 S7:** the archetype specifies 254px cells. Measured at 30px `body`, "Digital Transformation" is ≈330px and "Artificial Intelligence" ≈320px — both **overflow a 254px cell** and would wrap to two lines, breaking the grid's baseline alignment. 414px (3 grid columns) is the smallest cell on the 12-column system that holds every discipline on one line, and it resolves to the exact 1728px usable width. Everything else about S7 is unchanged.

**On-screen type:**

Headline (primary, sound-off carrier):
```
Secure by design.
```
- Step: **`headline`** — 76px / 500 / `-2.0px` / `1.10` / `fg/primary`. One line (≈610px).
- Anchor A: `x = 96`, block bottom baseline `y = 856`.

Grid cells (secondary, sequential reveal — exactly as `script.md` specifies):

| Cell | index (mono) | name |
|---|---|---|
| 1 | `01` | Artificial Intelligence |
| 2 | `02` | Data Engineering |
| 3 | `03` | Enterprise Software |
| 4 | `04` | Platform Engineering |
| 5 | `05` | Cloud Engineering |
| 6 | `06` | Cybersecurity |
| 7 | `07` | Digital Transformation |

- Index — `--font-mono`, **24px** / 400 / `+1.9px` / `fg/tertiary #6B7A8C`. Set at 24px, not 17px, because §2 restricts `fg/tertiary` to ≥24px text. Baseline 36px below the cell's top rule.
- Name — step **`body`**: 30px / 400 / `-0.2px` / **`fg/primary #F2EFE8`** (per §8 S7, which specifies `fg/primary` for the discipline name). Baseline 96px below the cell's top rule.
- Copy is verbatim from the seven verified disciplines in `brief.md`. No eighth item, no "and more", no ordering that implies specialisation ranking.

**Camera:** **Push in, reduced.** Hairline grid layer `scale 1.000 → 1.020`, `translateY 0 → -11px`, `translateX 0 → +3px` (§4.2B mid-layer values). **Grid-cell layer and type layer both hold `scale 1.000`**, `translateY 0 → -18px`.

> **Why reduced:** the cell grid spans the full 1728px usable width, so its outer edges sit exactly on the 96px title-safe boundary. Any scale above 1.000 on that layer pushes cell 4 outside title-safe — an automatic §9.3 QA failure. The felt camera move is carried entirely by the background hairline layer and the type's Y drift, which is sufficient at this dwell length. This is R1 applied strictly.

**Motion:** f0–14 headline reveals. **Legible by f14** — the fastest primary-message landing in the film, which is correct for the film's longest scene. f24 onward the seven cells reveal in reading order: 14f mask reveal, **5-frame stagger** (§8 S7), so cell 1 at f24, cell 7 at f54, last cell settled at **f68**. Each cell's top rule draws `scaleX 0 → 1` from left, 11 frames, 5 frames ahead of its text. Static **f68–228 (160 frames)** — this is the scan window; a sound-off viewer reads all seven disciplines in one pass without a single cut. Exit f228–237.

**Transition IN:** **T1 — Hard cut, 0 frames.** Cut on the VO's "Zero-trust."

**Edit note:** this is the film's longest scene at exactly the 240-frame maximum. It is at the maximum on purpose: seven items at 30px need dwell, not cutting, and the alternative (splitting into two scenes) would push the film to 13 scenes and strand the disciplines across a cut. If measured VO shortens beat 6, take frames off this scene first — it is the only Act III scene with slack, and it must never exceed 240.

---

### `s11-the-record`

| | |
|---|---|
| **Beat** | 7 — CREDIBILITY · "Registered, active, and contract-ready — across federal, state, local, and prime programs." |
| **Archetype** | **S8** — Credential block / the record |
| **Frames** | start **1500** · duration **150** · end **1650** (0:50.000 – 0:55.000) |
| **Asset** | `motion-graphics` (over an **optional** plate — see fallback) |

**Visual construction (back to front):**
1. **Backdrop** — `plate-record-surface` at **0.90 scrim** of `bg/deep #060C15` (§8 S8). If that optional plate is not generated, the sanctioned alternative is flat `bg/base #0B1523` with the 96px hairline grid at 0.18. Either way this frame is nearly black; the record is the only thing the eye can go to.
2. **Credential container** — §6.4 verbatim:
   - `x = 96`, width **1144px** (8 columns), **bottom edge at `y = 940`** (respects the 140px LinkedIn bottom reserve).
   - Fill `#141F2E` at `opacity 0.94`, `backdrop-filter: blur(18px) saturate(0.9)`.
   - Top rule: 1px `#2C3E56`, full container width.
   - Accent tick: 2px × 56px `#C6A15B`, flush left, sitting **on** the top rule and extending 12px above it.
   - Padding 32 top / 28 bottom / 32 left / 32 right.
3. **Record table inside the container** — 4 columns, each **254px** wide, 24px gutters:

   | | col 1 | col 2 | col 3 | col 4 |
   |---|---|---|---|---|
   | Row 1 (`data-label`) | `SAM.GOV` | `UEI` | `CAGE` | `CLASSIFICATION` |
   | Row 2 (`data`) | `ACTIVE` | `YGRB3SMAWE6` | `22PQ4` | `SMALL BUSINESS` |

   Row 3 (`legal`, single line, mono, full container width):
   ```
   NAICS 541511 · 541512 · 541519 · 518210 · 541715
   ```
4. **Headline** above the container.
5. **Logo lockup** — bottom-right, cap height 44px, right edge `x = 1824`, baseline `y = 940`, baseline-aligned to the credential container (§6.6). *See the blocking asset note in §4.*
6. Vignette 50%, grain `0.034`.

**On-screen type:**

Headline:
```
Registered. Active. Contract-ready.
```
- Step: **`headline-sm`** — 60px / 400 / `-1.3px` / `1.16` / `fg/primary`. One line (≈1020px, inside the 1144px container width it is aligned to).
- **Placement — documented Anchor A variant:** `x = 96`, block bottom baseline at **`y = 724`**, not the standard `y = 856`. The credential container owns the `y = 772–940` band, so the Anchor A block is raised to sit directly above it. Left edge, alignment and measure are unchanged. This is the only y-offset Anchor A takes in the film.
- Stepped down from 76px to 60px deliberately: in this scene the *record* is the hero and the headline is the label that tells the viewer what they are looking at (`script.md`, Beat 7 intent).

Container type:
- Row 1 — step **`data-label`**, `--font-mono`: 17px / 400 / `+1.9px` / uppercase / `fg/secondary #9DAABA` at `opacity 0.75`.
- Row 2 — step **`data`**, `--font-mono`: 32px / 400 / `+0.4px` / `1.30` / `fg/primary #F2EFE8`, `font-feature-settings: "tnum" 1, "ss01" 1` so the identifiers do not jitter.
- Row 3 — step **`legal`**, `--font-mono`: 18px / 400 / `+0.3px` / `fg/secondary` at `opacity 0.75`.

**Claim check:** every string in this scene appears verbatim in `brief.md`'s grounding list. No FedRAMP, ATO, IL level, DoD authorisation, SOC 2, NIST, agency name, contract vehicle, award, metric or headcount appears. "Certified" appears only inside "SMALL BUSINESS" classification context, and the narration says "registered, active, and contract-ready" — never "certified" — exactly as `script.md` requires.

**Camera:** **Settle-out**, §4.2B parallax. Backdrop plate `scale 1.045 → 1.000`, `translateY 0 → -6px`, `translateX 0 → -4px`. **Container and all type hold `scale 1.000`**, `translateY 0 → -10px` (reduced from 18px: the container's bottom edge is pinned at `y = 940` against the LinkedIn bottom reserve and must not drift into it).

**Motion:** **f0–16 the container grows** — `clip-path: inset(100% 0 0 0) → inset(0)`, 16 frames, `E.enter` (§6.4). f16 onward the four columns reveal with the standard text rule at **4-frame stagger**: col 1 at f16, col 4 at f28, settled at **f42**. Row 3 (NAICS) at f44–58. Headline reveals f6–20. **Legible by f42.** Static f58–138. Exit f138–147.

**Edit note — mandatory VO offset:** `script.md` requires the credential card be **up before the VO starts, not synced to it**. Beat 7's first word must land no earlier than **film frame 1518** (scene frame 18), i.e. after the container has fully drawn. Direct audio-director to place a ≥0.6s gap between the end of beat 6 and the start of beat 7 in the narration assembly. Do not solve this by starting the scene earlier — that would cut away from the disciplines mid-sentence.

**Transition IN:** **T4 — Strata descent, 20 frames.** [T4 use 3 of 3.] `s10`'s discipline grid `scale 1.00 → 1.22`, `opacity 1 → 0`, `E.descend`; `s11`'s backdrop `scale 0.94 → 1.00`, `opacity 0 → 1`, `E.enter`, entering at frame 6 of the outgoing move. The capabilities scale past the lens and the record rises from beneath them: the registrations are the substrate the capabilities stand on. The container's own 16-frame `clip-path` growth begins as the descent resolves, so the two moves read as one gesture.

---

### `s12-cta`

| | |
|---|---|
| **Beat** | 8 — CTA · "NISTA Technologies. Intelligent software for mission-critical organizations. Modernize with confidence." |
| **Archetype** | **S9** — CTA lockup |
| **Frames** | start **1650** · duration **150** · end **1800** (0:55.000 – 1:00.000) |
| **Asset** | `motion-graphics` |

**Visual construction (back to front):**
1. `bg/deep #060C15` — flat, edge to edge. No grid, no plate, no texture beyond grain.
2. **Lockup layer** — Anchor B, horizontally centred, block optical centre at **`y = 496`**, max block width 1144px. Stack, top to bottom:
   - **Logo**, cap height **72px**.
   - 32px gap.
   - **2px × 96px `accent/signal #C6A15B` rule**, centred. (Area 192px² = 0.009% of frame.)
   - 40px gap.
   - **CTA line**, `display` 108px, two lines.
   - 56px gap.
   - **`nistatech.com`**, `body` 30px.
   - Measured block height ≈ 456px → block occupies `y ≈ 268–724`. Fully inside title-safe, well clear of the `y = 940` bottom reserve.
3. Vignette at **50%** of §5.3 values. Grain **0.034**.

**On-screen type:**
```
Modernize with
confidence.

nistatech.com
```
- CTA line — step **`display`**: 108px / 500 / `-3.2px` / `1.04` (112px) / `fg/primary #F2EFE8`, centred.
  **Set on two lines.** At 108px with −3.2px tracking the single-line measure is ≈1320px, over the 1144px Anchor B maximum. Break after "with".
- URL — step **`body`**: 30px / 400 / `-0.2px` / `fg/secondary #9DAABA`, centred.
- The positioning line ("Intelligent software for mission-critical organizations") is **spoken only, never set on screen.** At 53 characters it cannot be made feed-legible without dropping below the display scale, and adding it would put four type elements plus a logo on the film's final frame. The narration carries it; the frame stays clean.
- **Anchor B is permitted here** — CTA lockup is one of §6.3's three sanctioned centred moments.

**Camera:** **None.** `scale 1.000`, `translateY 0`, no drift on any layer. The film has moved through depth for 55 seconds; it stops. Freeze is power (§4.6).

**Motion:** f0–8 the dip resolves. f10–24 logo reveals (standard 14f mask reveal — **no draw-on, no assembly, no spin**, §6.6). f18–27 the amber rule draws `scaleX 0 → 1` from centre, 9 frames. f24–38 CTA line 1, f28–42 CTA line 2. f40–54 `nistatech.com`. **Legible by f42.** **All motion ends at f54.** Static f54–150 — **96 frames of dead-still hold**, four times the §4.6 minimum. No exit animation: the film ends on this frame.

> **Grain freeze — mandatory, and a QA trap if missed:** §5.4 re-rolls the grain seed every frame (`seed = frame % 7`). §9.10 fails the draft if motion is detected in the final 24 frames. Animated grain **is** frame-to-frame pixel change and will trip a naive motion detector. **From film frame 1776 (scene frame 126) to 1800, lock the grain seed to a constant** so the final 24 frames are pixel-identical. Implement as `seed = frame >= 1776 ? 3 : frame % 7`.

**Transition IN:** **T2 — Dip to deep, 16 frames** (8 out / 8 in), 2 frames of pure `#060C15` at the midpoint. **[T2 use 3 of 3 — Act III → Act IV boundary.]** Required by §8 S9 ("Enters on T2 dip-to-deep"). Because the incoming background *is* `#060C15`, the dip resolves into the CTA background invisibly — the record dissolves to black and the lockup simply appears in it.

---

## 3. Ledgers

### 3.1 Transition ledger

| Into scene | Transition | Frames | Budget position | Justification |
|---|---|---|---|---|
| s01 | T2 (in-half only) | 8 | *not counted* — no outgoing scene | Film open from `bg/deep` |
| s02 | **T1 Hard cut** | 0 | — | Motion beat on "Modernization" |
| s03 | **T4 Strata descent** | 20 | T4 **1 / 3** | Into the signature strata scene |
| s04 | **T2 Dip to deep** | 16 | T2 **1 / 3** | Act I → Act II boundary |
| s05 | **T3 Strata Wipe** | 18 | T3 **1 / 2** | Entering an architecture/diagram scene (§4.3) |
| s06 | **T1 Hard cut** | 0 | — | Abstraction → person; bluntness is the point |
| s07 | **T4 Strata descent** | 20 | T4 **2 / 3** | Design stratum → build stratum, no cut of person |
| s08 | **T3 Strata Wipe** | 18 | T3 **2 / 2** | Entering an architecture/diagram scene (§4.3) |
| s09 | **T2 Dip to deep** | 16 | T2 **2 / 3** | Act II → Act III boundary, bottom of descent |
| s10 | **T1 Hard cut** | 0 | — | Act III tight cutting |
| s11 | **T4 Strata descent** | 20 | T4 **3 / 3** | Capabilities → the record beneath them |
| s12 | **T2 Dip to deep** | 16 | T2 **3 / 3** | Act III → Act IV; mandated by §8 S9 |

**Totals:** T1 × 4 · T2 × 3 (+1 half-use at the film open) · T3 × 2 · T4 × 3. **Eleven transitions. Zero outside the §4.3 vocabulary. Longest is 20 frames** (§7.21 ceiling).

**Deviation from §4.3's usage guidance, flagged for creative-director:**
- **T3 Strata Wipe is used 2×, not 4×.** §4.3 scopes T3 to "entering an architecture/diagram scene." The 12-scene structure contains exactly **two** S4 diagram scenes, and every one of them is entered on T3. Manufacturing two more wipes would require inventing diagram scenes the script has no room for. **Compliance is complete; the count is lower because the population is lower.**
- **T1 is 4 of 11 (36%), not ~60%.** T2 (3, all mandated: three act boundaries plus the §8 S9 requirement), T3 (2, all mandated by the diagram rule) and T4 (3, the "used 3× only" signature quota) account for 8 of the 11 available slots, leaving 3–4 for hard cuts. The ~60% figure assumes a higher scene count than 60 seconds at a 72-frame minimum allows. **If a higher hard-cut ratio is preferred, the single lever is `s11`: swapping its T4 for a T1 raises T1 to 45% and drops T4 to 2 uses.** I recommend keeping the T4 — the "record beneath the capabilities" descent is the strongest reading of the transition in the film.

### 3.2 Accent (`accent/signal #C6A15B`) ledger — §2 4% rule

| Scene | Accent present? | Elements | Est. frame area |
|---|---|---|---|
| s01 | **No** | — | 0% |
| s02 | Yes | eyebrow tick + eyebrow text | ~0.09% |
| s03 | Yes | 2px through-line | ~0.20% |
| s04 | Yes | eyebrow tick + eyebrow text | ~0.09% |
| s05 | Yes | eyebrow tick/text + **one** active node | ~0.35% |
| s06 | **No** | — | 0% |
| s07 | **No** | — | 0% |
| s08 | Yes | eyebrow tick/text + **one** active node | ~0.38% |
| s09 | Yes | 2px × 1728px underline | ~0.17% |
| s10 | **No** | — | 0% |
| s11 | Yes | 2px × 56px container tick + logo mark accent | ~0.06% |
| s12 | Yes | 2px × 96px rule + logo mark accent | ~0.03% |

Peak is **~0.38%** against a 4.00% ceiling. Accent is **entirely absent from archetypes S1, S5 and S7** (four scenes), satisfying §2's "absent from at least 3 of the 9 archetypes." **Never two amber nodes on screen at once.** No filled bars, no background washes, no amber gradients, no accent text over 6 words.

### 3.3 Archetype coverage

| Archetype | Scenes | Count |
|---|---|---|
| S1 Cinematic plate | s01 | 1 |
| S2 Statement card | s02, s04 | 2 |
| S3 Strata descent | s03 | 1 |
| S4 Architecture diagram | s05, s08 | 2 |
| S5 Engineering vignette | s06, s07 | 2 |
| S6 Assurance triad | s09 | 1 |
| S7 Discipline grid | s10 | 1 |
| S8 Credential block | s11 | 1 |
| S9 CTA lockup | s12 | 1 |

**All 9 archetypes used. No bespoke scenes.** 8 of 12 scenes (67% of scenes, 67% of runtime) are pure motion graphics with zero generation cost.

### 3.4 Camera-move alternation (§4.2A — never two identical moves back to back)

`push → settle → descent → push → settle → push → settle → push → settle → push(reduced) → settle → static`

No repetition. The film's only static scene is its last.

---

## 4. Asset requirements

### 4.1 Generation

Full specification in **`projects/nista-launch/asset-plan.json`**. Summary:

| Asset | Scene | Type | Required | Note |
|---|---|---|---|---|
| `plate-ops-floor` | s01 | image | **yes** | S1 institutional surface |
| `plate-whiteboard` | s06 | image | **yes** | S5 the design vignette |
| `plate-keyboard` | s07 | image | **yes** | S5 the build vignette |
| `plate-record-surface` | s11 | image | no | Optional; `bg/base` is the sanctioned alternative per §8 S8 |
| `clip-keyboard-microcut` | s07 | video | no | Optional **replacement** for `plate-keyboard`, not an addition |

**3 required stills** against a ceiling of 5. **0 required video clips** against a ceiling of 2.
Every generation prompt is written by **prompt-engineer**, not here. This document specifies *intent* and *compositional constraint* only.

### 4.2 Why no generated video by default

Per CLAUDE.md provider logic and §8 S5, video is justified only when live micro-motion materially
outperforms a still. It does not here:

- The §4.2A camera move (`scale 1.000 → 1.055` over 4–5 seconds) already supplies the movement. A
  generated clip would add a *second* motion source on top of it, and §1 is explicit that nothing
  in this film accelerates.
- Both S5 plates are **hands**. Generated hands in motion are the single highest-probability
  uncanny artifact in current image-to-video models, and s06/s07 are the film's credibility beats —
  the two frames where an artifact costs the most.
- The whiteboard plate must contain **no legible words**. Video generation is materially worse at
  holding that constraint across 100+ frames than a single still is across one.

`clip-keyboard-microcut` is filed as `required: false` so asset-producer has a sanctioned, budgeted
escalation path if visual-director judges the still under-delivers — but the still is the default
and the fallback.

### 4.3 Existing assets (no generation)

- `public/assets/nista-launch/score.wav` — 60s original underscore, −24.7 LUFS. Already produced.

### 4.4 BLOCKING — missing mandatory brand asset

**There is no NISTA logo file anywhere in this repository.** `find` across the project returns no
logo asset, and `public/assets/nista-launch/` contains only `score.wav`. The logo is required in
**two** scenes:

- `s11-the-record` — bottom-right, cap height 44px, right edge `x = 1824`, baseline `y = 940`.
- `s12-cta` — Anchor B, cap height 72px, above the amber rule. **The final frame of the film.**

Per CLAUDE.md autonomy rules, a missing **mandatory brand asset** is an ask-the-user condition, not
a decision the studio should make silently. **This must be escalated to the user before
ASSET_PRODUCTION.**

**Sanctioned interim so the storyboard is renderable:** a typographic wordmark — `NISTA` set in
`--font-display` at **500**, tracking `+2.4px`, `fg/primary #F2EFE8`, with `TECHNOLOGIES` beneath at
`data-label` scale (mono, 17px, `+1.9px`, `fg/secondary` @ 0.75) — sized to the specified cap
heights. This obeys every §2/§3 rule and reads as deliberate rather than as a placeholder, but it is
**not** a substitute for the real mark and must not ship without the user's confirmation.

---

## 5. Compliance self-check

| § | Check | Result |
|---|---|---|
| §9.1 | No banned cyan/violet hue family | **Pass** — palette is navy / steel / amber only; no scene specifies any other hue |
| §9.2 | `accent/signal` ≤ 4% of frame | **Pass** — peak ~0.38% (s08) |
| §9.3 | Type inside 96px title-safe; nothing critical below `y = 940` | **Pass** — enforced by R1 (type layer never scales) and by the reduced push in s10; s11 container bottom pinned at `y = 940` |
| §9.4 | Every scene 72–240 frames | **Pass** — min 120 (s04), max 240 (s10) |
| §9.5 | Message legible by scene frame 45 | **Pass** — latest is s08 and s11 at f42–45 |
| §9.6 | Transitions in the 4-item set, ≤20 frames | **Pass** — longest 20 (T4) |
| §9.7 | No `spring()`, no weight 600, no `Inter` | **Pass** — R6; all easing from the `E` library |
| §9.8 | No claim outside `brief.md` grounding; no SOC 2 / NIST | **Pass** — every on-screen string traced to the grounding list; SOC 2 and NIST appear nowhere |
| §9.9 | Contrast ≥ 4.5:1 | **Pass** — all type uses `fg/primary` (15.96:1), `fg/secondary` (7.76:1), `fg/secondary` @ 0.75 (≈5.4:1) or `accent/signal` (7.55:1); `fg/tertiary` used only at 24px in s10 |
| §9.10 | No motion in the final 24 frames | **Pass** — s12 all motion ends at scene frame 54 (film frame 1704); **grain seed must be locked from film frame 1776** (see s12) |
| §7.20 | ≤3 cuts in any 4-second (120f) window | **Pass** — smallest inter-cut gap is 120 frames, so at most 2 cuts in any 120f window |
| §7 | No bullets, icons, rounded cards, progress bars, scrolling grids, particle fields, fake UI, letterbox bars | **Pass** — none specified; the s02/s04/s10 grids explicitly do not scroll |

---

## 6. Frame arithmetic verification

**I checked this, by construction and by re-addition.**

Contiguity — each scene's `end` equals the next scene's `start`, with no gap and no overlap:

```
s01   0 + 180 =  180   →  s02 starts  180   ✓
s02 180 + 126 =  306   →  s03 starts  306   ✓
s03 306 + 144 =  450   →  s04 starts  450   ✓
s04 450 + 120 =  570   →  s05 starts  570   ✓
s05 570 + 126 =  696   →  s06 starts  696   ✓
s06 696 + 150 =  846   →  s07 starts  846   ✓
s07 846 + 144 =  990   →  s08 starts  990   ✓
s08 990 + 132 = 1122   →  s09 starts 1122   ✓
s09 1122 + 138 = 1260  →  s10 starts 1260   ✓
s10 1260 + 240 = 1500  →  s11 starts 1500   ✓
s11 1500 + 150 = 1650  →  s12 starts 1650   ✓
s12 1650 + 150 = 1800  →  end of film       ✓
```

Sum of durations:

```
180 + 126 + 144 + 120 + 126 + 150 + 144 + 132 + 138 + 240 + 150 + 150
= 306 + 144 + 120 + 126 + 150 + 144 + 132 + 138 + 240 + 150 + 150
= 450 + 120 + 126 + 150 + 144 + 132 + 138 + 240 + 150 + 150
= 570 + 126 + 150 + 144 + 132 + 138 + 240 + 150 + 150
= 696 + 150 + 144 + 132 + 138 + 240 + 150 + 150
= 846 + 144 + 132 + 138 + 240 + 150 + 150
= 990 + 132 + 138 + 240 + 150 + 150
= 1122 + 138 + 240 + 150 + 150
= 1260 + 240 + 150 + 150
= 1500 + 150 + 150
= 1650 + 150
= 1800
```

**Total = 1800 frames = 60.000s at 30fps. First scene starts at frame 0. Last scene ends at frame
1800. No gaps. No overlaps. Verified.**

Scene-length bounds: minimum **120** (s04) ≥ 72 ✓ · maximum **240** (s10) ≤ 240 ✓ · all twelve
scenes inside the §4.6 window.

Transition frames are overlaps at the cuts (R2) and are therefore already contained within the
durations above; they add nothing to the total.
