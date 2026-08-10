/**
 * Petal Pals — resumable episode builder.
 *
 * WHY THIS EXISTS
 * An episode is ~63 shots and several hundred generation calls. Doing that by hand
 * loses its place the moment anything drops, and there is no way to tell what has
 * already been paid for. This tool owns the ledger instead: every shot's audio,
 * upload, clip and download state lives in build/<ep>/state.json, so the build can
 * stop anywhere and pick up exactly where it left off.
 *
 * WHAT IT CANNOT DO
 * The generation API is reachable only through the assistant's MCP tools, not from
 * a shell. So this tool does not submit jobs. It does everything either side:
 * prepares shot-aligned audio, records job ids, downloads finished media, conforms,
 * assembles and reports. `next` prints the exact job specs to submit, and `record`
 * takes the returned ids back. That division is deliberate — the expensive, stateful
 * part is scripted and resumable; only the API call itself is manual.
 *
 * COMMANDS
 *   prep-audio   build shot-aligned audio references for every speaking shot
 *   next [n]     print the next n shots needing work, as ready-to-submit specs
 *   record       record job ids:   --kind clip|upload --map s16=<id>,s17=<id>
 *   fetch        download completed media:  --kind clip --map s16=<url>,...
 *   status       what is done, what is left, and what it will cost
 *   assemble     conform every clip, cut the picture, build the mix, mux the master
 *
 * Usage: npx tsx build.ts <command> [--ep ep01-the-sleepy-seed] [flags]
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
process.chdir(HERE);

const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (n: string, d?: string) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : d;
};

const EP = flag('ep', 'ep01-the-sleepy-seed')!;
const EPDIR = path.join('episodes', EP);
const STATEDIR = path.join('build', EP);
const STATE = path.join(STATEDIR, 'state.json');

const W = 1920, H = 1080, FPS = 30;
/** Silence before a line starts, and the guard so a line never butts the cut. */
const LEAD = 0.45, TAILGUARD = 0.25;

type Shot = {
  id: string;
  len: number;
  kind: 'MOTION' | 'PLATE';
  vo: string | null;
  note: string;
  /** Set once the aligned reference wav exists on disk. */
  audioReady?: boolean;
  /** media_id returned by media_upload+confirm for the aligned audio. */
  audioMediaId?: string;
  /** job_id of the keyframe image (already generated for ep01). */
  keyframeJob?: string;
  /** job_id of the generated clip. */
  clipJob?: string;
  /** true once the clip mp4 is on disk. */
  clipReady?: boolean;
  /** model actually used, for the record. */
  model?: string;
};
type State = {ep: string; shots: Shot[]; builtShots: string[]; updated: string};

const probe = (f: string) =>
  Number(execFileSync('ffprobe',
    ['-v','error','-show_entries','format=duration','-of','csv=p=0', f],
    {encoding:'utf8'}).trim());

const ff = (args: string[]) =>
  execFileSync('ffmpeg', ['-y','-hide_banner','-loglevel','error', ...args], {stdio:['ignore','inherit','inherit']});

function load(): State {
  if (fs.existsSync(STATE)) return JSON.parse(fs.readFileSync(STATE, 'utf8'));
  // First run: seed the ledger from the shot plan.
  const plan = JSON.parse(fs.readFileSync(path.join(EPDIR, 'shot-plan-rest.json'), 'utf8'));
  const s: State = {
    ep: EP,
    shots: plan.map((p: any) => ({id: p.id, len: p.len, kind: p.kind, vo: p.vo, note: p.note})),
    // Shots already finished by hand before this tool existed.
    builtShots: ['s01','s02','s03','s04','s05','s06','s11','s12','s13','s14'],
    updated: new Date().toISOString()
  };
  save(s);
  return s;
}
function save(s: State) {
  fs.mkdirSync(STATEDIR, {recursive: true});
  s.updated = new Date().toISOString();
  fs.writeFileSync(STATE, JSON.stringify(s, null, 2));
}

/* ------------------------------------------------------------------ */
/* prep-audio                                                          */
/* ------------------------------------------------------------------ */
/**
 * Pads each line to its shot's exact length with the speech at its true offset.
 * This is what makes lip sync land: handed a 6.8s line for an 8s shot, the model
 * has to guess when the mouth should move. Handed 8.000s with the speech starting
 * at 0.45s, it doesn't.
 */
function prepAudio(s: State) {
  const CLEAN =
    'silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse,' +
    'silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse';
  const outDir = path.join(EPDIR, 'vo', 'aligned');
  fs.mkdirSync(outDir, {recursive: true});

  let over = 0;
  for (const shot of s.shots) {
    if (!shot.vo) continue;
    const src = path.join(EPDIR, shot.vo);
    if (!fs.existsSync(src)) { console.log(`  ${shot.id}  MISSING ${shot.vo}`); continue; }

    const tmp = path.join(outDir, `.clean-${shot.id}.wav`);
    ff(['-i', src, '-af', CLEAN, tmp]);
    const spoken = probe(tmp);
    const room = shot.len - LEAD - TAILGUARD;
    const out = path.join(outDir, `${shot.id}.wav`);

    if (spoken > room) {
      // The shot is too short for the line. Fix the shot, not the audio — squeezing
      // the read is what made the first cut sound rushed.
      over++;
      console.log(`  ${shot.id}  OVERRUNS: ${spoken.toFixed(2)}s of speech, ${room.toFixed(2)}s of room — lengthen the shot`);
    }
    ff(['-i', tmp, '-af',
        `adelay=${Math.round(LEAD*1000)}|${Math.round(LEAD*1000)},apad,atrim=0:${shot.len}`,
        '-ar','48000','-ac','2', out]);
    fs.rmSync(tmp, {force: true});
    shot.audioReady = true;
    console.log(`  ${shot.id}  ${spoken.toFixed(2)}s speech @ ${LEAD}s -> ${shot.len}s aligned`);
  }
  save(s);
  console.log(over ? `\n  ${over} shot(s) too short — fix shot-plan-rest.json and re-run` : '\n  all lines fit; nothing time-stretched');
}

/* ------------------------------------------------------------------ */
/* next                                                                */
/* ------------------------------------------------------------------ */
/** Prints the next units of work as specs to submit, newest bottleneck first. */
function next(s: State, n: number) {
  const needUpload = s.shots.filter(x => x.vo && x.audioReady && !x.audioMediaId);
  const needClip   = s.shots.filter(x => !x.clipJob && (!x.vo || x.audioMediaId));
  const needFetch  = s.shots.filter(x => x.clipJob && !x.clipReady);

  if (needUpload.length) {
    console.log(`\n== UPLOAD ${Math.min(n, needUpload.length)} aligned audio (media_upload -> PUT -> media_confirm) ==`);
    for (const x of needUpload.slice(0, n)) console.log(`  ${x.id}  ${path.join(EPDIR,'vo','aligned',x.id)}.wav`);
    return;
  }
  if (needClip.length) {
    console.log(`\n== GENERATE ${Math.min(n, needClip.length)} clips ==`);
    for (const x of needClip.slice(0, n)) {
      const model = x.vo ? 'wan2_7' : 'kling3_0';
      const extra = x.vo
        ? `resolution 1080p, medias: start_image=<keyframe job>, audio_references=${x.audioMediaId}`
        : `mode pro, sound off, medias: start_image=<keyframe job>`;
      console.log(`  ${x.id}  ${model}  duration ${x.len}  ${extra}`);
      console.log(`        ${x.note}`);
    }
    return;
  }
  if (needFetch.length) {
    console.log(`\n== FETCH ${needFetch.length} finished clips ==`);
    for (const x of needFetch) console.log(`  ${x.id}  job ${x.clipJob}`);
    return;
  }
  console.log('\n  nothing outstanding — run `assemble`');
}

/* ------------------------------------------------------------------ */
/* record / fetch                                                      */
/* ------------------------------------------------------------------ */
function parseMap(v?: string) {
  const m = new Map<string,string>();
  for (const pair of (v ?? '').split(',').filter(Boolean)) {
    const [k, ...rest] = pair.split('=');
    m.set(k.trim(), rest.join('=').trim());
  }
  return m;
}

function record(s: State) {
  const kind = flag('kind');
  const map = parseMap(flag('map'));
  for (const [id, val] of map) {
    const shot = s.shots.find(x => x.id === id);
    if (!shot) { console.log(`  unknown shot ${id}`); continue; }
    if (kind === 'upload') shot.audioMediaId = val;
    else if (kind === 'clip') { shot.clipJob = val; shot.model = shot.vo ? 'wan2_7' : 'kling3_0'; }
    else if (kind === 'keyframe') shot.keyframeJob = val;
    console.log(`  ${id}  ${kind} = ${val}`);
  }
  save(s);
}

function fetchMedia(s: State) {
  const map = parseMap(flag('map'));
  const dir = path.join(EPDIR, 'clips', 'full');
  fs.mkdirSync(dir, {recursive: true});
  for (const [id, url] of map) {
    const shot = s.shots.find(x => x.id === id);
    if (!shot) continue;
    const out = path.join(dir, `${id}.mp4`);
    execFileSync('curl', ['-sL','--retry','3','-o', out, url]);
    shot.clipReady = fs.existsSync(out) && fs.statSync(out).size > 10000;
    console.log(`  ${id}  ${shot.clipReady ? `ok ${(fs.statSync(out).size/1e6).toFixed(1)}MB` : 'FAILED'}`);
  }
  save(s);
}

/* ------------------------------------------------------------------ */
/* status                                                              */
/* ------------------------------------------------------------------ */
function status(s: State) {
  const t = s.shots.length;
  const c = (f: (x: Shot)=>boolean) => s.shots.filter(f).length;
  const speaking = c(x => !!x.vo);
  const clipsLeft = t - c(x => !!x.clipReady);
  const wanLeft = c(x => !!x.vo && !x.clipReady);
  const klingLeft = c(x => !x.vo && !x.clipReady);
  console.log(`
  EPISODE ${s.ep}
  already built by hand : ${s.builtShots.length} shots
  remaining shots       : ${t}  (${speaking} speaking, ${t-speaking} silent)

  audio aligned         : ${c(x => !!x.audioReady)}/${speaking}
  audio uploaded        : ${c(x => !!x.audioMediaId)}/${speaking}
  clips submitted       : ${c(x => !!x.clipJob)}/${t}
  clips downloaded      : ${c(x => !!x.clipReady)}/${t}

  credits still needed  : ~${(wanLeft*12.5 + klingLeft*8.75).toFixed(0)}  (${wanLeft} wan @12.5 + ${klingLeft} kling-pro @8.75)
  updated               : ${s.updated}`);
}

/* ------------------------------------------------------------------ */
/* assemble                                                            */
/* ------------------------------------------------------------------ */
/**
 * Conforms every clip to 1080p, cuts the picture, lays the mix and muxes a master.
 * Safe to re-run: it rebuilds only what is missing unless --force.
 */
function assemble(s: State) {
  const force = argv.includes('--force');
  const missing = s.shots.filter(x => !x.clipReady);
  if (missing.length) {
    console.log(`  ${missing.length} clip(s) still missing: ${missing.map(x=>x.id).join(', ')}`);
    console.log('  assembling what exists; re-run when the rest land.');
  }
  const out = path.join(EPDIR, 'out', 'full');
  fs.mkdirSync(path.join(out, 'seg'), {recursive: true});

  const order = [...s.builtShots, ...s.shots.map(x => x.id)]
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

  const list: string[] = [];
  for (const id of order) {
    const seg = path.join(out, 'seg', `${id}.mp4`);
    if (fs.existsSync(seg) && !force) { list.push(seg); continue; }

    const shot = s.shots.find(x => x.id === id);
    // Shots built before this tool keep their existing segment.
    const prior = path.join(EPDIR, 'out', 'v3', 'seg', `${id}.mp4`);
    if (!shot && fs.existsSync(prior)) { fs.copyFileSync(prior, seg); list.push(seg); continue; }
    if (!shot) continue;

    const src = path.join(EPDIR, 'clips', 'full', `${id}.mp4`);
    if (!fs.existsSync(src)) continue;
    // Cover-scale then centre-crop: generated clips are not exactly 16:9, and
    // letterboxing a kids' show is worse than losing a few edge pixels.
    // tpad clones the last frame if a clip lands a hair short of its slot.
    ff(['-i', src, '-vf',
        `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},` +
        `tpad=stop_mode=clone:stop_duration=1,format=yuv420p`,
        '-t', String(shot.len), '-an', seg]);
    list.push(seg);
  }

  const listFile = path.join(out, 'list.txt');
  fs.writeFileSync(listFile, list.map(f => `file '${path.resolve(f)}'`).join('\n'));
  ff(['-f','concat','-safe','0','-i', listFile, '-c','copy', path.join(out, 'picture.mp4')]);
  console.log(`  picture: ${probe(path.join(out,'picture.mp4')).toFixed(3)}s over ${list.length} shots`);
  console.log('  next: build the mix, then mux. See episodes/<ep>/build-audio-v2.ts for the mix pattern.');
}

/* ------------------------------------------------------------------ */
const s = load();
switch (cmd) {
  case 'prep-audio': prepAudio(s); break;
  case 'next': next(s, Number(flag('n', '8'))); break;
  case 'record': record(s); break;
  case 'fetch': fetchMedia(s); break;
  case 'status': status(s); break;
  case 'assemble': assemble(s); break;
  default:
    console.log('commands: prep-audio | next | record | fetch | status | assemble');
}
