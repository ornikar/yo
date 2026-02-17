#!/usr/bin/env node
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { diffLines } = require('diff');
const jscodeshift = require('jscodeshift');

const args = process.argv.slice(2);
const [targetPath] = args;

// Check for --dry argument to enable dry run mode
const isDryRun = args.includes('--dry');

// Check for --only argument to run a specific codemod
const onlyArg = args.find((arg) => arg.startsWith('--only='));
const codemodName = onlyArg ? onlyArg.split('=')[1] : null;

if (!targetPath) {
  throw new Error('❌ Usage: node scripts/run-codemods.js <targetPath> [--dry] [--only=<codemodName>]');
}

if (!fs.existsSync(targetPath)) {
  throw new Error(`❌ Path "${targetPath}" does not exist.`);
}

const codemodsDir = path.join(__dirname, '../lib/codemods');
const codemodFiles = fs
  .readdirSync(codemodsDir)
  .filter((file) => file.endsWith('.js') && (!codemodName || file === `${codemodName}.js`));

if (codemodFiles.length === 0) {
  console.log('✅ No codemods to apply.');
}

console.log(`🛠  Found ${codemodFiles.length} codemod(s) to apply to: ${targetPath}`);

// Utility to recursively collect all .ts/.tsx files
function getAllFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = [...results, ...getAllFiles(fullPath)];
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const filesToTransform = fs.statSync(targetPath).isDirectory() ? getAllFiles(targetPath) : [targetPath];
const updatedFiles = new Set();

// Execute each codemod
(async () => {
  for (const transformFile of codemodFiles) {
    const transformPath = path.join(codemodsDir, transformFile);
    const codemod = require(transformPath);
    console.log(`➡️  Running codemod: ${transformFile}`);

    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      filesToTransform.map(async (filePath) => {
        const source = fs.readFileSync(filePath, 'utf8');

        try {
          const transformed = await codemod(
            { path: filePath, source },
            { jscodeshift: jscodeshift.withParser('tsx') },
            { printOptions: { quote: 'single', trailingComma: true } },
          );

          if (typeof transformed === 'string' && transformed !== source) {
            if (isDryRun) {
              console.log(`🔍 ${filePath}`);
              const diff = diffLines(source, transformed);
              diff.forEach((part) => {
                const color = part.added ? '\u001B[32m' : part.removed ? '\u001B[31m' : '\u001B[0m';
                const prefix = part.added ? '+' : part.removed ? '-' : ' ';
                const lines = part.value.split('\n').map((line) => `${prefix} ${line}`);
                process.stdout.write(`${color}${lines.join('\n')}\u001B[0m\n`);
              });
            } else {
              fs.writeFileSync(filePath, transformed, 'utf8');
              console.log(`✅ Updated: ${filePath}`);
            }

            updatedFiles.add(filePath);
          }
        } catch (error) {
          if (error.message.includes('TSSatisfiesExpression')) {
            console.warn(`⚠️ Skipping unsupported file (satisfies): ${filePath}`);
          } else {
            throw new Error(`❌ Error transforming ${filePath}: ${error.message}`);
          }
        }
      }),
    );
  }

  if (isDryRun) {
    console.log(`🚧 Dry run complete. ${updatedFiles.size} file(s) would be modified.`);
    console.log('Run without --dry to apply changes.');
  } else {
    console.log(`🏁 All codemods done. ${updatedFiles.size} file(s) modified.`);
  }
})();
