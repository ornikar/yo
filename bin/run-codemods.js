#!/usr/bin/env node
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { diffLines } = require('diff');
const { globSync } = require('glob');
const jscodeshift = require('jscodeshift');
const prompts = require('prompts');

const codemodsDir = path.join(__dirname, '../lib/codemods');

const onCancel = () => process.exit(0);

function getCodemods() {
  return globSync('*/*/*/index.js', { cwd: codemodsDir }).map((file) => ({
    id: path.dirname(file),
    path: path.join(codemodsDir, file),
  }));
}

async function runCodemods(targetPath, codemods, isDryRun) {
  console.log(`\n🛠  ${codemods.length} codemod(s) sur : ${targetPath}${isDryRun ? ' (dry run)' : ''}\n`);

  const isDirectory = fs.statSync(targetPath).isDirectory();
  const files = isDirectory ? globSync(`${targetPath}/**/*.{ts,tsx}`) : [targetPath];
  const updatedFiles = new Set();

  for (const codemod of codemods) {
    console.log(`➡️  Running codemod: ${codemod.id}`);
    const transform = require(codemod.path);

    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      files.map(async (filePath) => {
        const source = fs.readFileSync(filePath, 'utf8');
        try {
          const transformed = await transform(
            { path: filePath, source },
            { jscodeshift: jscodeshift.withParser('tsx') },
            { printOptions: { quote: 'single', trailingComma: true } },
          );

          if (typeof transformed !== 'string' || transformed === source) return;

          if (isDryRun) {
            console.log(`🔍 ${filePath}`);
            diffLines(source, transformed).forEach((part) => {
              const color = part.added ? '\u001B[32m' : part.removed ? '\u001B[31m' : '\u001B[0m';
              const prefix = part.added ? '+' : part.removed ? '-' : ' ';
              process.stdout.write(
                `${color}${part.value
                  .split('\n')
                  .map((l) => `${prefix} ${l}`)
                  .join('\n')}\u001B[0m\n`,
              );
            });
          } else {
            fs.writeFileSync(filePath, transformed, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
          }

          updatedFiles.add(filePath);
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
    console.log(`\n🚧 Dry run terminé. ${updatedFiles.size} fichier(s) seraient modifiés.`);
  } else {
    console.log(`\n🏁 Terminé. ${updatedFiles.size} fichier(s) modifiés.`);
  }
}

async function main() {
  const allCodemods = getCodemods();

  if (allCodemods.length === 0) {
    console.log('✅ Aucun codemod trouvé.');
    return;
  }

  const { targetPath } = await prompts(
    { type: 'text', name: 'targetPath', message: 'Sur quel path exécuter les codemods ?', initial: './' },
    { onCancel },
  );

  if (!fs.existsSync(targetPath)) {
    throw new Error(`❌ Le chemin "${targetPath}" n'existe pas.`);
  }

  const { selected } = await prompts(
    {
      type: 'multiselect',
      name: 'selected',
      message: 'Sélectionne les codemods à exécuter',
      choices: allCodemods.map((c) => ({ title: c.id, value: c.id })),
      hint: 'Espace pour sélectionner · Entrée pour valider',
      instructions: false,
      min: 1,
    },
    { onCancel },
  );

  const codemods = allCodemods.filter((c) => selected.includes(c.id));

  const { isDryRun } = await prompts(
    {
      type: 'confirm',
      name: 'isDryRun',
      message: 'Dry run ?',
      initial: false,
    },
    { onCancel },
  );

  await runCodemods(targetPath, codemods, isDryRun);
}

main().catch((error) => {
  throw new Error(error.message);
});
