import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-test-'));

const fontes = [
  'src/lib/calculator.ts',
  'src/lib/quickcalc.ts',
  'src/lib/assistant.ts',
  'src/lib/parameters.ts',
  'src/lib/types.ts',
  'src/lib/format.ts',
];

execFileSync(
  'npx',
  ['tsc', '--ignoreConfig', ...fontes, '--outDir', out, '--module', 'commonjs', '--target', 'es2020', '--esModuleInterop', '--skipLibCheck', '--strict'],
  { cwd: root, stdio: 'inherit' },
);

execFileSync('node', [path.join(root, 'tests/engine.test.cjs')], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, CF_TEST_OUT: out },
});

fs.rmSync(out, { recursive: true, force: true });
