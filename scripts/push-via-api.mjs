import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = process.env.CF_REPO || 'napauaabdul-hub/Abdul19h';
const BRANCH = process.env.CF_BRANCH || 'main';
const root = process.cwd();

const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).trim().split('\n');
console.log(`${files.length} ficheiros tracked`);

function gh(args, inputFile) {
  const cmd = ['api', ...args];
  if (inputFile) cmd.push('--input', inputFile);
  return execFileSync('gh', cmd, { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 }).trim();
}

const entries = [];
for (const f of files) {
  const buf = fs.readFileSync(path.join(root, f));
  fs.writeFileSync('/tmp/cf-blob.json', JSON.stringify({ content: buf.toString('base64'), encoding: 'base64' }));
  const sha = JSON.parse(gh(['-X', 'POST', `repos/${REPO}/git/blobs`, '-q', '.sha'], '/tmp/cf-blob.json'));
  entries.push({ path: f, mode: '100644', type: 'blob', sha });
  if (entries.length % 25 === 0) console.log(`blobs ${entries.length}/${files.length}`);
}

fs.writeFileSync('/tmp/cf-tree.json', JSON.stringify({ tree: entries }));
const treeSha = JSON.parse(gh(['-X', 'POST', `repos/${REPO}/git/trees`, '-q', '.sha'], '/tmp/cf-tree.json'));
console.log('tree:', treeSha);

const msg = execFileSync('git', ['log', '-1', '--pretty=%B'], { cwd: root, encoding: 'utf8' }).trim();
fs.writeFileSync(
  '/tmp/cf-commit.json',
  JSON.stringify({
    message: `NAPAUA BUILD — histórico completo do projeto\n\n${msg}\n\n(commits locais: ${execFileSync('git', ['rev-list', '--count', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()})`,
    tree: treeSha,
  }),
);
const commitSha = JSON.parse(gh(['-X', 'POST', `repos/${REPO}/git/commits`, '-q', '.sha'], '/tmp/cf-commit.json'));
console.log('commit:', commitSha);

fs.writeFileSync('/tmp/cf-ref.json', JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha: commitSha }));
console.log('ref:', gh(['-X', 'POST', `repos/${REPO}/git/refs`, '-q', '.ref'], '/tmp/cf-ref.json'));
console.log('PUSH OK →', `https://github.com/${REPO}/tree/${BRANCH}`);
