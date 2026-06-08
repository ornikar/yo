'use strict';

/**
 * Migrates Tag components from @ornikar/kitt-universal to @ornikar/bumper.
 *
 * Handles:
 *  - import updates: `Tag` (value) and `TagProps` (type) move to `@ornikar/bumper`.
 *    `TagColor` / `TagSize` are NOT exported by bumper (it ships the runtime
 *    constants TAG_COLORS_LIST / TAG_SIZES_LIST instead and the value sets
 *    differ), so they are left on their kitt import and flagged with a leading
 *    TODO for manual review.
 *  - `color`: literal values map 1:1 except `deepPurple` → `beige` (bumper accent
 *    role). Static `color="deepPurple"` gets a leading design-QA comment. Inside
 *    dynamic expressions every `deepPurple` literal is rewritten the same way; a
 *    ternary whose branches collapse to the same literal is simplified.
 *  - `size`: `medium` (kitt default) and `large` → `large`; `small` → `small`.
 *    A missing `size` becomes an explicit `size="large"` (kitt defaulted to
 *    `medium`, bumper defaults to `small`). A bare `size={variable}` is wrapped as
 *    `size={variable === 'medium' ? 'large' : variable}`; literal `'medium'` inside
 *    other dynamic expressions is rewritten to `'large'`.
 *  - `withWhiteBorder`: removed (no bumper equivalent).
 *  - spread props `<Tag {...x} />`: flagged for manual review — `withWhiteBorder`,
 *    `size` and `color` arriving through the spread cannot be remapped safely
 *    (destructuring an unknown-typed object would not type-check).
 */

const jscodeshift = require('jscodeshift');
const prettier = require('prettier');

// --- Value mappings ---

// Only `deepPurple` changes value; every other kitt color keeps its name in bumper.
const COLOR_MAP = { deepPurple: 'beige' };
// kitt `medium`/`large` collapse to bumper `large`; only `small` stays.
const SIZE_MAP = { small: 'small', medium: 'large', large: 'large' };

const TAG_VALUE_NAMES = new Set(['Tag']);
const TAG_TYPE_NAMES = new Set(['TagProps']);
// Imported, never migrated — flagged for manual review.
const TAG_UNSUPPORTED_TYPE_NAMES = new Set(['TagColor', 'TagSize']);
const ALL_TAG_IMPORT_NAMES = new Set([...TAG_VALUE_NAMES, ...TAG_TYPE_NAMES, ...TAG_UNSUPPORTED_TYPE_NAMES]);

const DEEP_PURPLE_COMMENT = ' deepPurple (accent) → beige — verify visual with design';
const TYPE_FLAG_COMMENT =
  ' TODO: [Tag migration] `TagColor` / `TagSize` are not exported by bumper — use the runtime constants `TAG_COLORS_LIST` / `TAG_SIZES_LIST` instead and update the value sets manually (the kitt and bumper sets differ).';
const SPREAD_FLAG_COMMENT =
  ' TODO: [Tag migration] props passed through `{...spread}` are not migrated — drop `withWhiteBorder`, remap `size` (`medium` → `large`) and `color` (`deepPurple` → `beige`) from the spread source manually.';

// --- Helpers ---

function isStringLiteralNode(node) {
  return node && (node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'));
}

function stringLiteralValue(node) {
  return isStringLiteralNode(node) ? node.value : null;
}

function isKittTagSource(value) {
  return value === '@ornikar/kitt-universal' || value.startsWith('@ornikar/kitt-universal/Tag');
}

// Recursively rewrite the literal values found in `map` anywhere inside `node`.
function remapStringLiteralsDeep(node, map) {
  if (!node || typeof node !== 'object') return;
  if (isStringLiteralNode(node)) {
    if (Object.prototype.hasOwnProperty.call(map, node.value)) node.value = map[node.value];
    return;
  }
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'range' || key === 'comments') continue;
    const child = node[key];
    if (Array.isArray(child)) child.forEach((c) => remapStringLiteralsDeep(c, map));
    else if (child && typeof child === 'object') remapStringLiteralsDeep(child, map);
  }
}

// Remap a `size` value-position expression: `medium` → `large`. A bare variable
// is wrapped (`x` → `x === 'medium' ? 'large' : x`); ternary branches are
// recursed into (the test is left untouched so comparisons are preserved); any
// other shape is returned unchanged.
function remapSizeValueExpression(j, expr) {
  if (isStringLiteralNode(expr)) {
    return Object.prototype.hasOwnProperty.call(SIZE_MAP, expr.value) ? j.stringLiteral(SIZE_MAP[expr.value]) : expr;
  }
  if (expr.type === 'Identifier') {
    return j.conditionalExpression(
      j.binaryExpression('===', j.identifier(expr.name), j.stringLiteral('medium')),
      j.stringLiteral('large'),
      j.identifier(expr.name),
    );
  }
  if (expr.type === 'ConditionalExpression') {
    expr.consequent = remapSizeValueExpression(j, expr.consequent);
    expr.alternate = remapSizeValueExpression(j, expr.alternate);
    return expr;
  }
  return expr;
}

function isPlainTag(openingElement, localName) {
  const name = openingElement.name;
  return name.type === 'JSXIdentifier' && name.name === localName;
}

function findEnclosingStatement(path) {
  let cur = path;
  while (cur.parent) {
    const node = cur.value;
    if (
      node &&
      typeof node.type === 'string' &&
      (node.type.endsWith('Statement') || node.type === 'VariableDeclaration')
    ) {
      return node;
    }
    cur = cur.parent;
  }
  return path.value;
}

function addLeadingComment(j, targetNode, text) {
  if (!targetNode.comments) targetNode.comments = [];
  const exists = targetNode.comments.some((c) => typeof c.value === 'string' && c.value === text);
  if (exists) return;
  const comment = j.commentLine(text);
  comment.leading = true;
  comment.trailing = false;
  targetNode.comments.push(comment);
}

// --- Transformer ---

module.exports = async function transformer(fileInfo, api) {
  // Force tsx so `import type`, type annotations and TS generics parse the same
  // way whether invoked from jest fixtures (.js) or bin/run-codemods.js (.tsx).
  const j = (api.jscodeshift || jscodeshift).withParser('tsx');
  const root = j(fileInfo.source);

  // ===== Step 0: detect kitt-universal Tag-related imports =====
  let tagLocalName = null;
  const found = { value: false, props: false, unsupported: false };

  root
    .find(j.ImportDeclaration)
    .filter((p) => p.value.source && isKittTagSource(p.value.source.value))
    .forEach((path) => {
      (path.value.specifiers || []).forEach((spec) => {
        if (spec.type !== 'ImportSpecifier') return;
        const imported = spec.imported.name;
        if (!ALL_TAG_IMPORT_NAMES.has(imported)) return;
        if (TAG_VALUE_NAMES.has(imported)) {
          found.value = true;
          if (!tagLocalName) tagLocalName = spec.local ? spec.local.name : imported;
        } else if (TAG_TYPE_NAMES.has(imported)) {
          found.props = true;
        } else if (TAG_UNSUPPORTED_TYPE_NAMES.has(imported)) {
          found.unsupported = true;
        }
      });
    });

  if (!found.value && !found.props && !found.unsupported) {
    return fileInfo.source;
  }

  // ===== Step 1: transform each <Tag /> JSX element =====
  if (found.value) {
    if (!tagLocalName) tagLocalName = 'Tag';

    root.find(j.JSXElement).forEach((path) => {
      const opening = path.value.openingElement;
      if (!isPlainTag(opening, tagLocalName)) return;

      const hasSpread = opening.attributes.some((a) => a.type === 'JSXSpreadAttribute');
      const newAttrs = [];
      let hasSize = false;
      let hasDeepPurpleLiteral = false;

      for (const attr of opening.attributes) {
        if (attr.type !== 'JSXAttribute') {
          newAttrs.push(attr);
          continue;
        }
        const propName = attr.name.name;

        // withWhiteBorder → remove
        if (propName === 'withWhiteBorder') continue;

        // color
        if (propName === 'color') {
          const literal = stringLiteralValue(attr.value);
          if (literal !== null) {
            if (Object.prototype.hasOwnProperty.call(COLOR_MAP, literal)) {
              if (literal === 'deepPurple') hasDeepPurpleLiteral = true;
              attr.value = j.stringLiteral(COLOR_MAP[literal]);
            }
            newAttrs.push(attr);
            continue;
          }
          if (attr.value && attr.value.type === 'JSXExpressionContainer') {
            const expr = attr.value.expression;
            remapStringLiteralsDeep(expr, COLOR_MAP);
            // Collapse a ternary whose branches became the same literal.
            if (expr.type === 'ConditionalExpression') {
              const cons = stringLiteralValue(expr.consequent);
              const alt = stringLiteralValue(expr.alternate);
              if (cons !== null && cons === alt) {
                attr.value = j.stringLiteral(cons);
              }
            }
            newAttrs.push(attr);
            continue;
          }
          newAttrs.push(attr);
          continue;
        }

        // size
        if (propName === 'size') {
          hasSize = true;
          const literal = stringLiteralValue(attr.value);
          if (literal !== null) {
            if (Object.prototype.hasOwnProperty.call(SIZE_MAP, literal)) {
              attr.value = j.stringLiteral(SIZE_MAP[literal]);
            }
            newAttrs.push(attr);
            continue;
          }
          if (attr.value && attr.value.type === 'JSXExpressionContainer') {
            attr.value = j.jsxExpressionContainer(remapSizeValueExpression(j, attr.value.expression));
            newAttrs.push(attr);
            continue;
          }
          newAttrs.push(attr);
          continue;
        }

        // label, icon, disabled, onRemove, key, … kept untouched
        newAttrs.push(attr);
      }

      // kitt defaulted to `medium`; bumper defaults to `small`. Make it explicit.
      // Skipped when spread props are present (the spread may already carry `size`).
      if (!hasSize && !hasSpread) {
        newAttrs.push(j.jsxAttribute(j.jsxIdentifier('size'), j.stringLiteral('large')));
      }

      opening.attributes = newAttrs;

      if (hasDeepPurpleLiteral) {
        addLeadingComment(j, findEnclosingStatement(path), DEEP_PURPLE_COMMENT);
      }
      if (hasSpread) {
        addLeadingComment(j, findEnclosingStatement(path), SPREAD_FLAG_COMMENT);
      }
    });
  }

  // ===== Step 2: imports rewrite =====
  function addBumperImport(specifierNames, isTypeOnly) {
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
        if (!already) target.value.specifiers.push(j.importSpecifier(j.identifier(name)));
      }
      return;
    }
    const newImport = j.importDeclaration(
      specifierNames.map((name) => j.importSpecifier(j.identifier(name))),
      j.literal('@ornikar/bumper'),
    );
    if (isTypeOnly) newImport.importKind = 'type';
    const allKitt = root
      .find(j.ImportDeclaration)
      .filter((p) => p.value.source && isKittTagSource(p.value.source.value));
    if (allKitt.length > 0) {
      allKitt.at(allKitt.length - 1).insertAfter(newImport);
    } else {
      root.find(j.Program).get().value.body.unshift(newImport);
    }
  }

  // Insert type first then value (later insertion ends up first → value, then type).
  if (found.props) addBumperImport(['TagProps'], true);
  if (found.value) addBumperImport(['Tag'], false);

  // Remove migrated specifiers (Tag, TagProps) from kitt imports; drop empty declarations.
  root
    .find(j.ImportDeclaration)
    .filter((p) => p.value.source && isKittTagSource(p.value.source.value))
    .forEach((path) => {
      const remaining = (path.value.specifiers || []).filter(
        (spec) =>
          spec.type !== 'ImportSpecifier' ||
          (!TAG_VALUE_NAMES.has(spec.imported.name) && !TAG_TYPE_NAMES.has(spec.imported.name)),
      );
      if (remaining.length > 0) path.value.specifiers = remaining;
      else j(path).remove();
    });

  // Flag the kitt import that still carries TagColor / TagSize.
  if (found.unsupported) {
    root
      .find(j.ImportDeclaration)
      .filter(
        (p) =>
          p.value.source &&
          isKittTagSource(p.value.source.value) &&
          (p.value.specifiers || []).some(
            (s) => s.type === 'ImportSpecifier' && TAG_UNSUPPORTED_TYPE_NAMES.has(s.imported.name),
          ),
      )
      .forEach((path) => addLeadingComment(j, path.value, TYPE_FLAG_COMMENT));
  }

  const output = root.toSource({ quote: 'single' });
  const prettierConfig = await prettier.resolveConfig(fileInfo.path);
  return prettier.format(output, { ...prettierConfig, filepath: fileInfo.path });
};
