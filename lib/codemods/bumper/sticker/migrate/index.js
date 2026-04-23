'use strict';

/**
 * Migrates Sticker components from @ornikar/kitt-universal to @ornikar/bumper.
 *
 * Handles: import updates, color value renames (darkGreen → greenDark,
 * darkBlue → blueDark, promo → lightning, darkPromo → lightningDark),
 * `color="disabled"` → `disabled` boolean prop (including ternary extraction),
 * and TODO flagging for `stretch` (no bumper equivalent).
 */

const jscodeshift = require('jscodeshift');
const prettier = require('prettier');

// --- Value mappings ---

const COLOR_RENAME_MAP = {
  darkGreen: 'greenDark',
  darkBlue: 'blueDark',
  promo: 'lightning',
  darkPromo: 'lightningDark',
};

const STICKER_IMPORT_NAMES = new Set(['Sticker', 'StickerProps', 'StickerColor', 'StickerSize']);

// --- Helpers ---

function isStringLiteralNode(node) {
  return node && (node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'));
}

function stringLiteralValue(node) {
  return isStringLiteralNode(node) ? node.value : null;
}

function renameColorLiteralsDeep(node) {
  if (!node || typeof node !== 'object') return;
  if (isStringLiteralNode(node)) {
    const mapped = COLOR_RENAME_MAP[node.value];
    if (mapped) node.value = mapped;
    return;
  }
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'range') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach(renameColorLiteralsDeep);
    } else if (child && typeof child === 'object') {
      renameColorLiteralsDeep(child);
    }
  }
}

function isPlainSticker(openingElement, stickerLocalName) {
  const name = openingElement.name;
  return name.type === 'JSXIdentifier' && name.name === stickerLocalName;
}

function addStretchTodoComment(j, path) {
  // Walk up until the containing top-level statement (direct child of Program).
  // This places the TODO above the enclosing function declaration rather than
  // inside the function body, matching the fixture expectations.
  let current = path;
  while (current.parent && current.parent.value.type !== 'Program') {
    current = current.parent;
  }
  const targetNode = current.value;
  if (!targetNode.comments) targetNode.comments = [];
  const alreadyFlagged = targetNode.comments.some(
    (c) => typeof c.value === 'string' && c.value.includes('Sticker migration'),
  );
  if (alreadyFlagged) return;
  const comment = j.commentLine(
    " TODO: [Sticker migration] `stretch` has no bumper equivalent. Remove the prop or wrap in <View width='100%' alignItems='center'>.",
  );
  comment.leading = true;
  targetNode.comments.push(comment);
}

// --- Transformer ---

module.exports = async function transformer(fileInfo, api) {
  const j = api.jscodeshift || jscodeshift;
  const root = j(fileInfo.source);

  // ===== Step 0: Detect kitt-universal Sticker imports =====
  const kittImports = root.find(j.ImportDeclaration, {
    source: { value: '@ornikar/kitt-universal' },
  });

  let stickerLocalName = null;
  const importedSpecifiers = { value: new Set(), type: new Set() };

  kittImports.forEach((path) => {
    const isTypeImport = path.value.importKind === 'type';
    const bucket = isTypeImport ? importedSpecifiers.type : importedSpecifiers.value;
    (path.value.specifiers || []).forEach((spec) => {
      if (spec.type !== 'ImportSpecifier') return;
      const imported = spec.imported.name;
      if (!STICKER_IMPORT_NAMES.has(imported)) return;
      bucket.add(imported);
      if (imported === 'Sticker' && !stickerLocalName) {
        stickerLocalName = spec.local ? spec.local.name : 'Sticker';
      }
    });
  });

  const hasAnyStickerImport = importedSpecifiers.value.size > 0 || importedSpecifiers.type.size > 0;
  if (!hasAnyStickerImport) {
    return fileInfo.source;
  }

  if (!stickerLocalName) stickerLocalName = 'Sticker';

  let stickersTransformed = 0;

  // ===== Step 1: Transform each <Sticker /> JSX element =====
  root.find(j.JSXElement).forEach((path) => {
    const element = path.value;
    const openingElement = element.openingElement;
    if (!isPlainSticker(openingElement, stickerLocalName)) return;

    const newAttrs = [];
    let hasStretchTodo = false;

    for (const attr of openingElement.attributes) {
      if (attr.type !== 'JSXAttribute') {
        newAttrs.push(attr);
        continue;
      }
      const propName = attr.name.name;

      // --- stretch: flag for manual review, keep prop in place ---
      if (propName === 'stretch') {
        // stretch={false} is a no-op, safe to drop silently
        if (attr.value && attr.value.type === 'JSXExpressionContainer') {
          const expr = attr.value.expression;
          if (
            (expr.type === 'BooleanLiteral' && expr.value === false) ||
            (expr.type === 'Literal' && expr.value === false)
          ) {
            continue;
          }
        }
        hasStretchTodo = true;
        newAttrs.push(attr);
        continue;
      }

      // --- color ---
      if (propName === 'color') {
        // color="xxx"
        const literalValue = stringLiteralValue(attr.value);
        if (literalValue !== null) {
          if (literalValue === 'disabled') {
            // Drop color, add bare `disabled`
            newAttrs.push(j.jsxAttribute(j.jsxIdentifier('disabled')));
            continue;
          }
          const renamed = COLOR_RENAME_MAP[literalValue];
          if (renamed) {
            attr.value = j.stringLiteral(renamed);
          }
          newAttrs.push(attr);
          continue;
        }

        // color={expr}
        if (attr.value && attr.value.type === 'JSXExpressionContainer') {
          const expr = attr.value.expression;

          // color={ternary} with one branch === 'disabled'
          if (expr.type === 'ConditionalExpression') {
            const consValue = stringLiteralValue(expr.consequent);
            const altValue = stringLiteralValue(expr.alternate);

            if (consValue === 'disabled' && altValue !== 'disabled') {
              // disabled branch in consequent → disabled={test}, color={alternate}
              newAttrs.push(j.jsxAttribute(j.jsxIdentifier('disabled'), j.jsxExpressionContainer(expr.test)));
              renameColorLiteralsDeep(expr.alternate);
              attr.value = isStringLiteralNode(expr.alternate)
                ? j.stringLiteral(expr.alternate.value)
                : j.jsxExpressionContainer(expr.alternate);
              newAttrs.push(attr);
              continue;
            }
            if (altValue === 'disabled' && consValue !== 'disabled') {
              // disabled branch in alternate → disabled={!test}, color={consequent}
              newAttrs.push(
                j.jsxAttribute(
                  j.jsxIdentifier('disabled'),
                  j.jsxExpressionContainer(j.unaryExpression('!', expr.test)),
                ),
              );
              renameColorLiteralsDeep(expr.consequent);
              attr.value = isStringLiteralNode(expr.consequent)
                ? j.stringLiteral(expr.consequent.value)
                : j.jsxExpressionContainer(expr.consequent);
              newAttrs.push(attr);
              continue;
            }
          }

          // Any other dynamic expression: recursively rename literal color values
          renameColorLiteralsDeep(expr);
          newAttrs.push(attr);
          continue;
        }

        newAttrs.push(attr);
        continue;
      }

      // Keep all other props as-is (label, size, disabled if already boolean, spread, etc.)
      newAttrs.push(attr);
    }

    openingElement.attributes = newAttrs;
    stickersTransformed++;

    if (hasStretchTodo) {
      addStretchTodoComment(j, path);
    }
  });

  // ===== Step 2: Rewrite imports =====
  // Even if no JSX elements were transformed (e.g. only types imported), we still swap imports.

  const valueSpecifiers = Array.from(importedSpecifiers.value);
  const typeSpecifiers = Array.from(importedSpecifiers.type);

  function addSpecifiersToBumperImport(specifierNames, isTypeOnly) {
    if (specifierNames.length === 0) return;

    const bumperImports = root
      .find(j.ImportDeclaration, { source: { value: '@ornikar/bumper' } })
      .filter((p) =>
        isTypeOnly ? p.value.importKind === 'type' : !p.value.importKind || p.value.importKind === 'value',
      );

    if (bumperImports.length > 0) {
      const target = bumperImports.at(0).get();
      for (const name of specifierNames) {
        const already = (target.value.specifiers || []).some(
          (s) => s.type === 'ImportSpecifier' && s.imported.name === name,
        );
        if (!already) {
          target.value.specifiers.push(j.importSpecifier(j.identifier(name)));
        }
      }
      return;
    }

    const newImport = j.importDeclaration(
      specifierNames.map((name) => j.importSpecifier(j.identifier(name))),
      j.literal('@ornikar/bumper'),
    );
    if (isTypeOnly) newImport.importKind = 'type';

    const allKittImports = root.find(j.ImportDeclaration, { source: { value: '@ornikar/kitt-universal' } });
    if (allKittImports.length > 0) {
      allKittImports.at(allKittImports.length - 1).insertAfter(newImport);
    } else {
      const body = root.find(j.Program).get().value.body;
      body.unshift(newImport);
    }
  }

  // Insert type import first, then value import. Both use insertAfter(last-kitt-u),
  // so the later insertion ends up positioned first → final order is value, then type.
  addSpecifiersToBumperImport(typeSpecifiers, true);
  addSpecifiersToBumperImport(valueSpecifiers, false);

  // Remove Sticker-related specifiers from kitt-universal imports
  root.find(j.ImportDeclaration, { source: { value: '@ornikar/kitt-universal' } }).forEach((path) => {
    const remaining = (path.value.specifiers || []).filter(
      (spec) => spec.type !== 'ImportSpecifier' || !STICKER_IMPORT_NAMES.has(spec.imported.name),
    );
    if (remaining.length > 0) {
      path.value.specifiers = remaining;
    } else {
      j(path).remove();
    }
  });

  const output = root.toSource({ quote: 'single' });
  const prettierConfig = await prettier.resolveConfig(fileInfo.path);

  return prettier.format(output, {
    ...prettierConfig,
    filepath: fileInfo.path,
  });
};
