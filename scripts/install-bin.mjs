import { readFileSync, symlinkSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const { bin } = JSON.parse(readFileSync('./package.json', 'utf8'));

for (const [name, file] of Object.entries(bin)) {
  const target = resolve(file);
  const link = `/usr/local/bin/${name}`;

  try {
    unlinkSync(link);
  } catch {
    // Ignore if the link does not exist
  }

  symlinkSync(target, link);
  console.log(`New symlink created: ${link} -> ${target}`);
}
