'use strict';

/**
 * Migrates ListItem components from @ornikar/kitt-universal to @ornikar/bumper.
 *
 * Bumper requires an explicit 3-slot model — `<ListItem.Leading>`,
 * `<ListItem.Content>`, `<ListItem.Trailing>` — and silently ignores any
 * children outside those slots. The codemod therefore wraps every naked
 * child of a source `<ListItem>` into `<ListItem.Content>`, moves the
 * `left={x}` prop into a `<ListItem.Leading>` slot and the `right={x}` prop
 * into a `<ListItem.Trailing>` slot, keeps a source `<ListItem.Content>` as-is,
 * and converts `<ListItem.SideContent>` / `<ListItem.SideContainer>` into
 * the appropriate Left/Right slot (using `<HStack gap="$space.4">` from
 * `@ornikar/bumper` when a SideContainer carries multiple children).
 *
 * Other transforms: `borders` → `hasDivider`, drop of `withPadding` /
 * `accessibilityRole="button"` (bumper applies the role automatically when
 * `onPress` is set) / `backgroundColor` / `borderColor`. `// MANUAL REVIEW:`
 * comments are emitted for `borders="top"`/`"both"`, non-center `align`,
 * ViewProps spread, `backgroundColor`/`borderColor`, `onPress` using the
 * event arg, multi-child right-side `SideContainer`, multiple left-side
 * `SideContent`, `accessibilityRole` other than `"button"`,
 * `accessibilityRole="button"` without `onPress`, and `styled(ListItem)`.
 */

const jscodeshift = require('jscodeshift');
const prettier = require('prettier');

const ALL_LIST_ITEM_NAMES = new Set([
  'ListItem',
  'ListItemProps',
  'ListItemContentProps',
  'ListItemSideContentProps',
  'ListItemSideContainerProps',
]);

const REVIEW_MESSAGES = {
  bordersTop:
    '[ListItem migration] `borders="top"` has no exact bumper equivalent. `hasDivider` only renders a divider at the bottom of the row.',
  bordersBoth:
    '[ListItem migration] `borders="both"` has no exact bumper equivalent. `hasDivider` only renders a divider at the bottom of the row.',
  viewSpread:
    '[ListItem migration] ViewProps spread is not supported on bumper `ListItem`. Extract known props manually.',
  viewBgBorder: '[ListItem migration] `backgroundColor` / `borderColor` are not supported on bumper `ListItem`.',
  sideContentAlign:
    '[ListItem migration] `ListItem.SideContent` `align` prop with non-center value has no bumper equivalent. Bumper applies `alignItems` at the row level only.',
  onPressEvent:
    '[ListItem migration] `onPress` event argument is not available in bumper `ListItem`. Remove or replace event-dependent logic.',
  sideContainerRight:
    '[ListItem migration] Multiple right-side elements wrapped in `<HStack gap="$space.4">`. Confirm gap and layout match the original `ListItem.SideContainer side="right"`.',
  accessibilityRoleNonButton:
    '[ListItem migration] `accessibilityRole` other than `"button"` is not supported on bumper `ListItem`. The prop has been dropped — re-implement accessibility manually if needed.',
  accessibilityRoleButtonWithoutOnPress:
    '[ListItem migration] `accessibilityRole="button"` was set without an `onPress`. Bumper applies `role="button"` only when `onPress` is provided — re-implement the interactive semantic if needed.',
  multipleLeftSideContent:
    '[ListItem migration] Multiple left-side `ListItem.SideContent` elements were combined inside a single `<ListItem.Leading>`. Bumper honors only one leading slot — verify the layout.',
  styled: '[ListItem migration] `styled(ListItem)` is not supported. Bumper does not expose the same styling surface.',
};

// Sort review messages alphabetically by their text so the order in which we
// emit them is deterministic regardless of the order in which we discovered them.
const REVIEW_ORDER = Object.keys(REVIEW_MESSAGES)
  .slice()
  .sort((a, b) => REVIEW_MESSAGES[a].localeCompare(REVIEW_MESSAGES[b]));

// --- Helpers ---

function isWhitespaceText(node) {
  return node && node.type === 'JSXText' && node.value.trim() === '';
}

function isPlainListItemElement(jsxElement, listItemLocalName) {
  if (!jsxElement || jsxElement.type !== 'JSXElement') return false;
  const name = jsxElement.openingElement.name;
  return name.type === 'JSXIdentifier' && name.name === listItemLocalName;
}

function isMemberJsx(node, obj, prop) {
  if (!node || node.type !== 'JSXElement') return false;
  const n = node.openingElement.name;
  return (
    n.type === 'JSXMemberExpression' &&
    n.object.type === 'JSXIdentifier' &&
    n.object.name === obj &&
    n.property.type === 'JSXIdentifier' &&
    n.property.name === prop
  );
}

function getJsxAttr(openingElement, name) {
  return (openingElement.attributes || []).find((a) => a.type === 'JSXAttribute' && a.name && a.name.name === name);
}

function isStringLiteralNode(node) {
  return node && (node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'));
}

function stringLiteralValue(node) {
  return isStringLiteralNode(node) ? node.value : null;
}

function functionUsesFirstParam(node) {
  if (!node) return false;
  if (node.type !== 'ArrowFunctionExpression' && node.type !== 'FunctionExpression') return false;
  const params = node.params || [];
  if (params.length === 0) return false;
  const first = params[0];
  // Destructured / pattern parameter → assume it's used.
  if (first.type !== 'Identifier') return true;
  const paramName = first.name;
  let used = false;
  function visit(n) {
    if (used || !n || typeof n !== 'object') return;
    if (n.type === 'Identifier' && n.name === paramName) {
      used = true;
      return;
    }
    for (const k of Object.keys(n)) {
      if (k === 'loc' || k === 'start' || k === 'end' || k === 'range') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === 'object') visit(v);
    }
  }
  visit(node.body);
  return used;
}

function findEnclosingTopLevelStatementPath(path) {
  let cur = path;
  while (cur.parent && cur.parent.value && cur.parent.value.type !== 'Program') {
    cur = cur.parent;
  }
  return cur;
}

function addLeadingReviewComment(j, path, reason) {
  const message = REVIEW_MESSAGES[reason];
  if (!message) return;
  const target = findEnclosingTopLevelStatementPath(path).value;
  if (!target.comments) target.comments = [];
  const exists = target.comments.some((c) => typeof c.value === 'string' && c.value.includes(message));
  if (exists) return;
  const comment = j.commentLine(' MANUAL REVIEW: ' + message);
  comment.leading = true;
  comment.trailing = false;
  target.comments.push(comment);
}

function flushReviews(j, ctx, path) {
  for (const reason of REVIEW_ORDER) {
    if (ctx.manualReviews.has(reason)) {
      addLeadingReviewComment(j, path, reason);
    }
  }
}

// Build a slot element <listItemLocalName.slotName>...</...> wrapping the given children.
function buildSlot(j, listItemLocalName, slotName, children) {
  const opening = j.jsxOpeningElement(
    j.jsxMemberExpression(j.jsxIdentifier(listItemLocalName), j.jsxIdentifier(slotName)),
    [],
    false,
  );
  const closing = j.jsxClosingElement(
    j.jsxMemberExpression(j.jsxIdentifier(listItemLocalName), j.jsxIdentifier(slotName)),
  );
  const inner = [];
  for (const c of children) {
    inner.push(j.jsxText('\n'));
    inner.push(c);
  }
  inner.push(j.jsxText('\n'));
  return j.jsxElement(opening, closing, inner);
}

// Wrap multiple children inside <HStack gap="$space.4"> ... </HStack>.
function buildHStack(j, children) {
  const attrs = [j.jsxAttribute(j.jsxIdentifier('gap'), j.stringLiteral('$space.4'))];
  const opening = j.jsxOpeningElement(j.jsxIdentifier('HStack'), attrs, false);
  const closing = j.jsxClosingElement(j.jsxIdentifier('HStack'));
  const inner = [];
  for (const c of children) {
    inner.push(j.jsxText('\n'));
    inner.push(c);
  }
  inner.push(j.jsxText('\n'));
  return j.jsxElement(opening, closing, inner);
}

// Convert a prop value (the inner of left={…} / right={…}) into a JSX child node.
function jsxValueAsChild(j, value) {
  if (!value) return null;
  if (value.type === 'JSXElement' || value.type === 'JSXFragment') return value;
  return j.jsxExpressionContainer(value);
}

// Get the inner expression of a JSX attribute value (handles both string literals and {expression}).
function attrValueAsExpression(attr) {
  if (!attr || !attr.value) return null;
  if (attr.value.type === 'JSXExpressionContainer') return attr.value.expression;
  return attr.value;
}

// --- Transformer ---

module.exports = async function transformer(fileInfo, api) {
  // Force tsx parser regardless of how the codemod is invoked. Mirrors
  // bin/run-codemods.js (`jscodeshift.withParser('tsx')`) so jest runs see
  // the same parser as production.
  const j = (api.jscodeshift || jscodeshift).withParser('tsx');
  const root = j(fileInfo.source);

  // ===== Step 0: Detect kitt-universal ListItem-related imports =====
  const kittImports = root.find(j.ImportDeclaration, {
    source: { value: '@ornikar/kitt-universal' },
  });

  let listItemLocalName = null;
  const importedSpecifiers = { value: new Set(), type: new Set() };

  kittImports.forEach((path) => {
    const isTypeImport = path.value.importKind === 'type';
    const bucket = isTypeImport ? importedSpecifiers.type : importedSpecifiers.value;
    (path.value.specifiers || []).forEach((spec) => {
      if (spec.type !== 'ImportSpecifier') return;
      const imported = spec.imported.name;
      if (!ALL_LIST_ITEM_NAMES.has(imported)) return;
      bucket.add(imported);
      if (imported === 'ListItem' && !listItemLocalName) {
        listItemLocalName = spec.local ? spec.local.name : 'ListItem';
      }
    });
  });

  const hasAnyListItemImport = importedSpecifiers.value.size > 0 || importedSpecifiers.type.size > 0;
  if (!hasAnyListItemImport) {
    return fileInfo.source;
  }
  if (!listItemLocalName) listItemLocalName = 'ListItem';

  // Track whether we needed to inject `HStack` (from SideContainer with multiple children).
  let needsHStackImport = false;

  // ===== Step 1: Transform each <ListItem> JSX element =====
  root.find(j.JSXElement).forEach((path) => {
    const element = path.value;
    if (!isPlainListItemElement(element, listItemLocalName)) return;

    const ctx = { manualReviews: new Set() };
    const newAttrs = [];
    let leftValue = null; // expression node from left={…} prop
    let rightValue = null; // expression node from right={…} prop
    let seenOnPress = false;
    let seenAccessibilityRoleButton = false;

    for (const attr of element.openingElement.attributes) {
      if (attr.type === 'JSXSpreadAttribute') {
        ctx.manualReviews.add('viewSpread');
        continue;
      }
      if (attr.type !== 'JSXAttribute') {
        newAttrs.push(attr);
        continue;
      }
      const propName = attr.name.name;

      if (propName === 'left') {
        leftValue = attrValueAsExpression(attr);
        continue;
      }
      if (propName === 'right') {
        rightValue = attrValueAsExpression(attr);
        continue;
      }
      if (propName === 'borders') {
        const literal = stringLiteralValue(attr.value);
        if (literal === 'bottom' || literal === 'top' || literal === 'both') {
          newAttrs.push(j.jsxAttribute(j.jsxIdentifier('hasDivider')));
        }
        if (literal === 'top') ctx.manualReviews.add('bordersTop');
        if (literal === 'both') ctx.manualReviews.add('bordersBoth');
        continue;
      }
      if (propName === 'withPadding') continue;
      if (propName === 'backgroundColor' || propName === 'borderColor') {
        ctx.manualReviews.add('viewBgBorder');
        continue;
      }
      if (propName === 'onPress') {
        seenOnPress = true;
        const expr = attrValueAsExpression(attr);
        if (expr && functionUsesFirstParam(expr)) {
          ctx.manualReviews.add('onPressEvent');
        }
      }
      if (propName === 'accessibilityRole') {
        const literal = stringLiteralValue(attr.value);
        if (literal === 'button') {
          // Bumper applies `role="button"` automatically when `onPress` is set.
          seenAccessibilityRoleButton = true;
          continue;
        }
        // Any other value (or dynamic expression) is unsupported. Drop and flag.
        ctx.manualReviews.add('accessibilityRoleNonButton');
        continue;
      }
      newAttrs.push(attr);
    }

    if (seenAccessibilityRoleButton && !seenOnPress) {
      ctx.manualReviews.add('accessibilityRoleButtonWithoutOnPress');
    }

    // ----- Walk children to populate the 3 slot buckets -----
    // `contentChildren` carries everything destined for `<ListItem.Content>` —
    // both the bare/naked children of the source and the inner children of any
    // source `<ListItem.Content>`. They get re-wrapped in a fresh slot.
    const leftFromChildren = [];
    const rightFromChildren = [];
    const contentChildren = [];

    let leftSideContentCount = 0;

    // First pass: locate the "content marker" — the first non-side-component child
    // (i.e. the first child that isn't SideContent / SideContainer / Left / Right).
    // SideContent placement is decided relative to this marker.
    const children = element.children || [];
    let contentMarkerIndex = -1;
    for (let i = 0; i < children.length; i += 1) {
      const c = children[i];
      if (isWhitespaceText(c)) continue;
      if (isMemberJsx(c, listItemLocalName, 'SideContent')) continue;
      if (isMemberJsx(c, listItemLocalName, 'SideContainer')) continue;
      if (isMemberJsx(c, listItemLocalName, 'Leading')) continue;
      if (isMemberJsx(c, listItemLocalName, 'Trailing')) continue;
      contentMarkerIndex = i;
      break;
    }

    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (isWhitespaceText(child)) continue;

      if (isMemberJsx(child, listItemLocalName, 'Content')) {
        for (const inner of (child.children || []).filter((c) => !isWhitespaceText(c))) {
          contentChildren.push(inner);
        }
        continue;
      }

      if (isMemberJsx(child, listItemLocalName, 'Leading')) {
        for (const inner of (child.children || []).filter((c) => !isWhitespaceText(c))) {
          leftFromChildren.push(inner);
        }
        continue;
      }

      if (isMemberJsx(child, listItemLocalName, 'Trailing')) {
        for (const inner of (child.children || []).filter((c) => !isWhitespaceText(c))) {
          rightFromChildren.push(inner);
        }
        continue;
      }

      if (isMemberJsx(child, listItemLocalName, 'SideContent')) {
        const alignAttr = getJsxAttr(child.openingElement, 'align');
        if (alignAttr) {
          const literal = stringLiteralValue(alignAttr.value);
          if (literal !== null && literal !== 'center') ctx.manualReviews.add('sideContentAlign');
          if (literal === null) ctx.manualReviews.add('sideContentAlign');
        }
        const real = (child.children || []).filter((c) => !isWhitespaceText(c));
        const isLeftSide = contentMarkerIndex < 0 || i < contentMarkerIndex;
        if (isLeftSide) {
          leftSideContentCount += 1;
          for (const c of real) leftFromChildren.push(c);
        } else {
          for (const c of real) rightFromChildren.push(c);
        }
        continue;
      }

      if (isMemberJsx(child, listItemLocalName, 'SideContainer')) {
        const sideAttr = getJsxAttr(child.openingElement, 'side');
        const sideLiteral = stringLiteralValue(sideAttr && sideAttr.value);
        const real = (child.children || []).filter((c) => !isWhitespaceText(c));
        const target = sideLiteral === 'right' ? rightFromChildren : leftFromChildren;
        if (real.length > 1) {
          needsHStackImport = true;
          if (sideLiteral === 'right') ctx.manualReviews.add('sideContainerRight');
          target.push(buildHStack(j, real));
        } else {
          for (const c of real) target.push(c);
        }
        continue;
      }

      // Naked child → goes to content slot.
      contentChildren.push(child);
    }

    if (leftSideContentCount > 1) ctx.manualReviews.add('multipleLeftSideContent');

    // ----- Merge the prop values into the slot buckets -----
    // `left={…}` gets prepended to the Left slot (so when both a prop and a
    // SideContent are present, the prop's value comes first).
    if (leftValue) leftFromChildren.unshift(jsxValueAsChild(j, leftValue));
    if (rightValue) rightFromChildren.unshift(jsxValueAsChild(j, rightValue));

    // ----- Build the new children array -----
    const newChildren = [];
    if (leftFromChildren.length > 0) {
      newChildren.push(j.jsxText('\n'));
      newChildren.push(buildSlot(j, listItemLocalName, 'Leading', leftFromChildren));
    }
    if (contentChildren.length > 0) {
      newChildren.push(j.jsxText('\n'));
      newChildren.push(buildSlot(j, listItemLocalName, 'Content', contentChildren));
    }
    if (rightFromChildren.length > 0) {
      newChildren.push(j.jsxText('\n'));
      newChildren.push(buildSlot(j, listItemLocalName, 'Trailing', rightFromChildren));
    }
    if (newChildren.length > 0) newChildren.push(j.jsxText('\n'));

    element.openingElement.attributes = newAttrs;
    element.children = newChildren;
    if (newChildren.length === 0) {
      element.openingElement.selfClosing = true;
      element.closingElement = null;
    } else {
      element.openingElement.selfClosing = false;
      if (!element.closingElement) {
        element.closingElement = j.jsxClosingElement(j.jsxIdentifier(listItemLocalName));
      }
    }

    flushReviews(j, ctx, path);
  });

  // ===== Step 2: Detect styled(ListItem) usages and flag for manual review =====
  root.find(j.CallExpression, { callee: { name: 'styled' } }).forEach((path) => {
    const args = path.value.arguments || [];
    if (args.length === 0) return;
    if (args[0].type !== 'Identifier' || args[0].name !== listItemLocalName) return;
    addLeadingReviewComment(j, path, 'styled');
  });

  // ===== Step 3: Imports rewrite =====
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
      // Sort specifiers alphabetically so adding `HStack` next to `ListItem`
      // produces a deterministic order regardless of insertion sequence.
      target.value.specifiers.sort((a, b) => {
        const an = a.type === 'ImportSpecifier' ? a.imported.name : '';
        const bn = b.type === 'ImportSpecifier' ? b.imported.name : '';
        return an.localeCompare(bn);
      });
      return;
    }
    const newImport = j.importDeclaration(
      specifierNames
        .slice()
        .sort()
        .map((name) => j.importSpecifier(j.identifier(name))),
      j.literal('@ornikar/bumper'),
    );
    if (isTypeOnly) newImport.importKind = 'type';
    const allKitt = root.find(j.ImportDeclaration, { source: { value: '@ornikar/kitt-universal' } });
    if (allKitt.length > 0) {
      allKitt.at(allKitt.length - 1).insertAfter(newImport);
    } else {
      const body = root.find(j.Program).get().value.body;
      body.unshift(newImport);
    }
  }

  const valueAdds = [];
  if (importedSpecifiers.value.has('ListItem')) valueAdds.push('ListItem');
  if (importedSpecifiers.value.has('ListItemProps')) valueAdds.push('ListItemProps');
  if (needsHStackImport) valueAdds.push('HStack');
  const typeAdds = [];
  if (importedSpecifiers.type.has('ListItemProps')) typeAdds.push('ListItemProps');

  // Insert type first then value (Sticker convention; later insertion ends up first).
  addBumperImport(typeAdds, true);
  addBumperImport(valueAdds, false);

  // Remove ListItem-related specifiers (and orphan types) from kitt-universal imports.
  root.find(j.ImportDeclaration, { source: { value: '@ornikar/kitt-universal' } }).forEach((path) => {
    const remaining = (path.value.specifiers || []).filter(
      (spec) => spec.type !== 'ImportSpecifier' || !ALL_LIST_ITEM_NAMES.has(spec.imported.name),
    );
    if (remaining.length > 0) {
      path.value.specifiers = remaining;
    } else {
      j(path).remove();
    }
  });

  const output = root.toSource({ quote: 'single' });
  const prettierConfig = await prettier.resolveConfig(fileInfo.path);
  return prettier.format(output, { ...prettierConfig, filepath: fileInfo.path });
};
