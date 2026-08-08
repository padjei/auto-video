import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

export function runQA(project: string, final = false) {
  const result = {critical: [] as string[], major: [] as string[], minor: [] as string[], metadata: null as any};
  const out = path.resolve('out', `${project}-${final ? 'final' : 'draft'}.mp4`);
  const dir = path.resolve('projects', project);

  if (!fs.existsSync(out)) {
    result.critical.push(`Missing render: ${out}`);
  } else {
    try {
      result.metadata = JSON.parse(execFileSync('ffprobe', [
        '-v','quiet','-print_format','json','-show_format','-show_streams',out
      ], {encoding:'utf8'}));
    } catch (e) {
      result.critical.push(`ffprobe failed: ${String(e)}`);
    }
  }

  for (const name of ['brief.md','storyboard.md','project.json','production-state.json']) {
    if (!fs.existsSync(path.join(dir,name))) result.major.push(`Missing project artifact: ${name}`);
  }

  const pj = path.join(dir,'project.json');
  if (fs.existsSync(pj)) {
    const data = JSON.parse(fs.readFileSync(pj,'utf8'));
    const scenes = data.scenes ?? [];
    if (scenes.length < 3) result.major.push('Video has fewer than 3 scenes.');
    if (!scenes.some((s:any) => s.type === 'cta')) result.major.push('No CTA scene found.');
    for (const s of scenes) {
      if ((s.headline ?? '').length > 90) result.minor.push(`Scene ${s.id} headline may be too long.`);
    }
  }

  const report = [
    `# QA Report — ${project}`,'',
    '## Critical', ...(result.critical.length ? result.critical.map(x=>`- ${x}`) : ['- None']),'',
    '## Major', ...(result.major.length ? result.major.map(x=>`- ${x}`) : ['- None']),'',
    '## Minor', ...(result.minor.length ? result.minor.map(x=>`- ${x}`) : ['- None']),''
  ].join('\n');

  fs.writeFileSync(path.join(dir,'qa-report.md'), report);
  return result;
}
