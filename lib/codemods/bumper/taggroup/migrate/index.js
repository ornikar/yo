'use strict';

/**
 * Migrates GroupTags components from @ornikar/kitt-universal to bumper's TagGroup.
 *
 * Handles:
 *  - imports: `GroupTags` → `TagGroup` (value), `GroupTagsProps` → `TagGroupProps`
 *    (type), and the co-imported `Tag` / `TagProps` move to `@ornikar/bumper`.
 *  - component rename `<GroupTags>` → `<TagGroup>` (open + close).
 *  - `size`: removed from the wrapper (bumper TagGroup has no `size`) and pushed
 *    onto every direct `<Tag>` child with the Tag size mapping (`medium` → `large`,
 *    `large` → `large`, `small` → `small`; a `size={variable}` becomes
 *    `size={variable === 'medium' ? 'large' : variable}`). This mirrors kitt
 *    GroupTags, which force-cloned `size` onto its children, so the pushed value
 *    overrides any size the child already declared. When the wrapper has no
 *    `size`, children are left untouched.
 *  - children: fragments are flattened, `{items.map(() => <Tag/>)}` gets the size
 *    injected inside the callback, `{cond && <Tag/>}` becomes
 *    `{cond ? <Tag/> : null}`, and ternary branches that are `<Tag>` get the size.
 *  - a single static `<Tag>` child collapses the wrapper away entirely.
 *  - design-QA TODO on every migrated group (overlap → 4px gap, white border gone,
 *    only-first-icon rule gone) and a manual-review TODO when a non-`Tag` child is
 *    found (bumper TagGroup only accepts `<Tag>` elements).
 *
 * Note: color remapping, `withWhiteBorder` removal and the default-size handling of
 * standalone `<Tag>` elements are the Tag codemod's responsibility, not this one.
 */

const jscodeshift = require('jscodeshift');
const prettier = require('prettier');

const SIZE_MAP = { small: 'small', medium: 'large', large: 'large' };

const VALUE_RENAME = { GroupTags: 'TagGroup', Tag: 'Tag' };
const TYPE_RENAME = { GroupTagsProps: 'TagGroupProps', TagProps: 'TagProps' };
const ALL_NAMES = new Set([...Object.keys(VALUE_RENAME), ...Object.keys(TYPE_RENAME)]);

const DESIGN_QA_COMMENT =
  ' TODO: TagGroup no longer overlaps tags / forces a white border / strips icons — verify with design';
const NON_TAG_COMMENT =
  ' TODO: [TagGroup migration] non-Tag children are not supported by bumper TagGroup (only `<Tag>` elements) — migrate or remove them manually.';
const SPREAD_COMMENT =
  ' TODO: [TagGroup migration] `size` may arrive through `{...spread}` — bumper TagGroup has no `size`; destructure it out and push it onto the `<Tag>` children manually.';

// --- Helpers ---

function isStringLiteralNode(node) {
  return node && (node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'));
}

function isKittSource(value) {
  return value === '@ornikar/kitt-universal' || value.startsWith('@ornikar/kitt-universal/');
}

// Structural clone that drops recast/positional metadata so a node can be reused
// twice in the same tree without confusing the printer.
function cloneAst(node) {
  if (Array.isArray(node)) return node.map(cloneAst);
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const key of Object.keys(node)) {
    if (['loc', 'start', 'end', 'range', 'tokens', 'comments', 'original', 'extra'].includes(key)) continue;
    out[key] = cloneAst(node[key]);
  }
  return out;
}

function jsxNameIs(nameNode, localName) {
  return nameNode && nameNode.type === 'JSXIdentifier' && nameNode.name === localName;
}

function isFragmentElement(node) {
  if (!node) return false;
  if (node.type === 'JSXFragment') return true;
  if (node.type === 'JSXElement') {
    const n = node.openingElement.name;
    if (n.type === 'JSXIdentifier' && n.name === 'Fragment') return true;
    if (n.type === 'JSXMemberExpression' && n.property.type === 'JSXIdentifier' && n.property.name === 'Fragment') {
      return true;
    }
  }
  return false;
}

function isWhitespaceText(node) {
  return node.type === 'JSXText' && node.value.trim() === '';
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
  if (targetNode.comments.some((c) => typeof c.value === 'string' && c.value === text)) return;
  const comment = j.commentLine(text);
  comment.leading = true;
  comment.trailing = false;
  targetNode.comments.push(comment);
}

// --- Transformer ---

module.exports = async function transformer(fileInfo, api) {
  const j = (api.jscodeshift || jscodeshift).withParser('tsx');
  const root = j(fileInfo.source);

  // ===== Step 0: detect kitt-universal GroupTags-related imports =====
  let groupLocalName = null;
  let tagLocalName = null;
  const found = { group: false, groupProps: false, tag: false, tagProps: false };

  root
    .find(j.ImportDeclaration)
    .filter((p) => p.value.source && isKittSource(p.value.source.value))
    .forEach((path) => {
      (path.value.specifiers || []).forEach((spec) => {
        if (spec.type !== 'ImportSpecifier') return;
        const imported = spec.imported.name;
        if (!ALL_NAMES.has(imported)) return;
        if (imported === 'GroupTags') {
          found.group = true;
          if (!groupLocalName) groupLocalName = spec.local ? spec.local.name : imported;
        } else if (imported === 'GroupTagsProps') {
          found.groupProps = true;
        } else if (imported === 'Tag') {
          found.tag = true;
          if (!tagLocalName) tagLocalName = spec.local ? spec.local.name : imported;
        } else if (imported === 'TagProps') {
          found.tagProps = true;
        }
      });
    });

  // Trigger only on GroupTags — Tag-only files are the Tag codemod's job.
  if (!found.group) return fileInfo.source;
  if (!groupLocalName) groupLocalName = 'GroupTags';
  if (!tagLocalName) tagLocalName = 'Tag';

  const isTagElement = (node) =>
    node && node.type === 'JSXElement' && jsxNameIs(node.openingElement.name, tagLocalName);
  const isGroupElement = (opening) => jsxNameIs(opening.name, groupLocalName);

  // ----- size handling -----
  // sizeInfo: null | { kind: 'literal', value } | { kind: 'expr', expr }
  function readSizeAttr(opening) {
    const attr = opening.attributes.find((a) => a.type === 'JSXAttribute' && a.name.name === 'size');
    if (!attr) return null;
    if (isStringLiteralNode(attr.value)) return { kind: 'literal', value: attr.value.value };
    if (attr.value && attr.value.type === 'JSXExpressionContainer') {
      return { kind: 'expr', expr: attr.value.expression };
    }
    return null;
  }

  function buildSizeAttr(sizeInfo) {
    if (sizeInfo.kind === 'literal') {
      const mapped = Object.prototype.hasOwnProperty.call(SIZE_MAP, sizeInfo.value)
        ? SIZE_MAP[sizeInfo.value]
        : sizeInfo.value;
      return j.jsxAttribute(j.jsxIdentifier('size'), j.stringLiteral(mapped));
    }
    // expr → size={expr === 'medium' ? 'large' : expr}
    return j.jsxAttribute(
      j.jsxIdentifier('size'),
      j.jsxExpressionContainer(
        j.conditionalExpression(
          j.binaryExpression('===', cloneAst(sizeInfo.expr), j.stringLiteral('medium')),
          j.stringLiteral('large'),
          cloneAst(sizeInfo.expr),
        ),
      ),
    );
  }

  // kitt GroupTags force-cloned `size` onto children, so the group's size wins:
  // drop any existing child `size` and set the mapped group size.
  function setSizeOnTag(tagElement, sizeInfo) {
    if (!sizeInfo) return;
    const opening = tagElement.openingElement;
    opening.attributes = opening.attributes.filter((a) => !(a.type === 'JSXAttribute' && a.name.name === 'size'));
    opening.attributes.push(buildSizeAttr(sizeInfo));
  }

  function getCallbackReturnedExpr(callback) {
    if (!callback || (callback.type !== 'ArrowFunctionExpression' && callback.type !== 'FunctionExpression')) {
      return null;
    }
    const body = callback.body;
    if (body.type !== 'BlockStatement') return body; // expression-bodied arrow
    const ret = body.body.find((s) => s.type === 'ReturnStatement');
    return ret ? ret.argument : null;
  }

  // Apply size to a value-position expression that should resolve to a <Tag>.
  // Returns { handled, nonTag }.
  function applySizeToExpression(container, sizeInfo, flags) {
    const expr = container.expression;

    // {items.map((it) => <Tag/>)}
    if (
      expr.type === 'CallExpression' &&
      expr.callee.type === 'MemberExpression' &&
      expr.callee.property.type === 'Identifier' &&
      expr.callee.property.name === 'map'
    ) {
      const returned = getCallbackReturnedExpr(expr.arguments[0]);
      if (returned && isTagElement(returned)) {
        setSizeOnTag(returned, sizeInfo);
      } else if (returned && returned.type === 'ConditionalExpression') {
        if (isTagElement(returned.consequent)) setSizeOnTag(returned.consequent, sizeInfo);
        if (isTagElement(returned.alternate)) setSizeOnTag(returned.alternate, sizeInfo);
      } else {
        flags.nonTag = true;
      }
      return;
    }

    // {cond && <Tag/>} → {cond ? <Tag/> : null}
    if (expr.type === 'LogicalExpression' && expr.operator === '&&' && isTagElement(expr.right)) {
      setSizeOnTag(expr.right, sizeInfo);
      container.expression = j.conditionalExpression(expr.left, expr.right, j.nullLiteral());
      return;
    }

    // {cond ? <Tag/> : <Tag/>|null}
    if (expr.type === 'ConditionalExpression') {
      let touched = false;
      if (isTagElement(expr.consequent)) {
        setSizeOnTag(expr.consequent, sizeInfo);
        touched = true;
      }
      if (isTagElement(expr.alternate)) {
        setSizeOnTag(expr.alternate, sizeInfo);
        touched = true;
      }
      if (!touched) flags.nonTag = true;
      return;
    }

    // {/* comment */} and other empty expressions: keep silently.
    if (expr.type === 'JSXEmptyExpression') return;

    // Opaque expression ({children}, an extracted array, a helper call…): can't push size.
    flags.nonTag = true;
  }

  // Flatten fragments and process each child in place; returns the new children array.
  function processChildren(children, sizeInfo, flags) {
    const out = [];
    for (const child of children) {
      if (isFragmentElement(child)) {
        const inner = child.type === 'JSXFragment' ? child.children : child.children;
        processChildren(inner, sizeInfo, flags).forEach((c) => out.push(c));
        continue;
      }
      if (child.type === 'JSXElement') {
        if (isTagElement(child)) {
          setSizeOnTag(child, sizeInfo);
        } else {
          flags.nonTag = true;
        }
        out.push(child);
        continue;
      }
      if (child.type === 'JSXExpressionContainer') {
        applySizeToExpression(child, sizeInfo, flags);
        out.push(child);
        continue;
      }
      if (child.type === 'JSXText') {
        if (!isWhitespaceText(child)) flags.nonTag = true; // raw text not supported
        out.push(child);
        continue;
      }
      out.push(child);
    }
    return out;
  }

  // ===== Step 1: transform each <GroupTags> =====
  let anyGroupRenamed = false;

  root.find(j.JSXElement).forEach((path) => {
    const element = path.value;
    const opening = element.openingElement;
    if (!isGroupElement(opening)) return;

    const sizeInfo = readSizeAttr(opening);

    // Single static <Tag> child → drop the wrapper entirely.
    const meaningful = element.children.filter((c) => !isWhitespaceText(c));
    if (meaningful.length === 1 && isTagElement(meaningful[0])) {
      const tag = meaningful[0];
      setSizeOnTag(tag, sizeInfo);
      j(path).replaceWith(tag);
      return;
    }

    // Drop `size` from the wrapper.
    opening.attributes = opening.attributes.filter((a) => !(a.type === 'JSXAttribute' && a.name.name === 'size'));

    // Process children (flatten fragments, push size, rewrite conditionals).
    const flags = { nonTag: false };
    element.children = processChildren(element.children, sizeInfo, flags);

    // Rename <GroupTags> → <TagGroup> (open + close).
    opening.name = j.jsxIdentifier('TagGroup');
    if (element.closingElement) element.closingElement.name = j.jsxIdentifier('TagGroup');
    anyGroupRenamed = true;

    // Design-QA flag + non-Tag flag + spread flag on the enclosing statement.
    const hasSpread = opening.attributes.some((a) => a.type === 'JSXSpreadAttribute');
    const stmt = findEnclosingStatement(path);
    addLeadingComment(j, stmt, DESIGN_QA_COMMENT);
    if (flags.nonTag) addLeadingComment(j, stmt, NON_TAG_COMMENT);
    if (hasSpread) addLeadingComment(j, stmt, SPREAD_COMMENT);
  });

  // ===== Step 2: rename GroupTagsProps identifier references (outside import specifiers) =====
  if (found.groupProps) {
    root.find(j.Identifier, { name: 'GroupTagsProps' }).forEach((path) => {
      const parent = path.parent && path.parent.value;
      if (parent && parent.type === 'ImportSpecifier' && parent.imported === path.value) return;
      path.value.name = 'TagGroupProps';
    });
  }

  // ===== Step 3: imports rewrite =====
  function addBumperImport(unsortedNames, isTypeOnly) {
    if (unsortedNames.length === 0) return;
    const specifierNames = unsortedNames.slice().sort();
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
    const allKitt = root.find(j.ImportDeclaration).filter((p) => p.value.source && isKittSource(p.value.source.value));
    if (allKitt.length > 0) allKitt.at(allKitt.length - 1).insertAfter(newImport);
    else root.find(j.Program).get().value.body.unshift(newImport);
  }

  const valueAdds = [];
  if (anyGroupRenamed) valueAdds.push('TagGroup');
  if (found.tag) valueAdds.push('Tag');
  const typeAdds = [];
  if (found.groupProps) typeAdds.push('TagGroupProps');
  if (found.tagProps) typeAdds.push('TagProps');

  addBumperImport(typeAdds, true);
  addBumperImport(valueAdds, false);

  // Remove migrated specifiers from kitt imports; drop empty declarations.
  root
    .find(j.ImportDeclaration)
    .filter((p) => p.value.source && isKittSource(p.value.source.value))
    .forEach((path) => {
      const remaining = (path.value.specifiers || []).filter(
        (spec) => spec.type !== 'ImportSpecifier' || !ALL_NAMES.has(spec.imported.name),
      );
      if (remaining.length > 0) path.value.specifiers = remaining;
      else j(path).remove();
    });

  const output = root.toSource({ quote: 'single' });
  const prettierConfig = await prettier.resolveConfig(fileInfo.path);
  return prettier.format(output, { ...prettierConfig, filepath: fileInfo.path });
};
