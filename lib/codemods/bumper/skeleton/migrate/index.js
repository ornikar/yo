'use strict';

/**
 * Migrates Skeleton components from @ornikar/kitt-universal to @ornikar/bumper.
 *
 * Handles: import updates (`Skeleton` value, `SkeletonProps` → `SkeletonShapeProps` type),
 * `<Skeleton>` → `<Skeleton.Shape type="rectangle|rounded">` (type chosen from
 * a `borderRadius` heuristic — circle-like radii become `rounded`, otherwise
 * `rectangle`), `<Skeleton.Circle size={s}>` → `<Skeleton.Shape type="rounded"
 * width={s} height={s}>`, `<Skeleton.Square size={s}>` → `<Skeleton.Shape
 * type="rectangle" width={s} height={s}>`, `<Skeleton.Bar>` →
 * `<Skeleton.Typography typographyVariant="body-m">` (with a TODO comment to
 * adjust the variant manually). Silently drops `isLoading`, `style`,
 * `borderRadius` and any other ViewProps (margin, position, flex,
 * backgroundColor…) — bumper `Skeleton.Shape` only accepts `type`, `width`,
 * `height`. Renames identifier references from `SkeletonProps` to
 * `SkeletonShapeProps` outside import specifiers.
 */

const jscodeshift = require('jscodeshift');
const prettier = require('prettier');

const SKELETON_IMPORT_NAMES = new Set(['Skeleton', 'SkeletonProps']);

// --- Helpers ---

function numericLiteralValue(node) {
  if (!node) return null;
  if (node.type === 'NumericLiteral') return node.value;
  if (node.type === 'Literal' && typeof node.value === 'number') return node.value;
  return null;
}

function attrNumericValue(attr) {
  if (!attr || !attr.value) return null;
  if (attr.value.type === 'JSXExpressionContainer') return numericLiteralValue(attr.value.expression);
  return null;
}

function isCircleLikeBorderRadius(rAttr, widthAttr, heightAttr) {
  const r = attrNumericValue(rAttr);
  if (r == null) return false;
  // The classic "infinite radius" idiom for a pill / circle.
  if (r >= 9999) return true;
  // A perfect circle when w === h and radius >= w / 2.
  const w = attrNumericValue(widthAttr);
  const h = attrNumericValue(heightAttr);
  if (w != null && h != null && w === h && r >= w / 2) return true;
  return false;
}

function isPlainSkeleton(openingElement, localName) {
  const name = openingElement.name;
  return name.type === 'JSXIdentifier' && name.name === localName;
}

function isSkeletonMember(openingElement, localName, memberName) {
  const name = openingElement.name;
  return (
    name.type === 'JSXMemberExpression' &&
    name.object.type === 'JSXIdentifier' &&
    name.object.name === localName &&
    name.property.type === 'JSXIdentifier' &&
    name.property.name === memberName
  );
}

function jsxMember(j, obj, prop) {
  return j.jsxMemberExpression(j.jsxIdentifier(obj), j.jsxIdentifier(prop));
}

function attrValueAsExpression(attr) {
  if (!attr || !attr.value) return null;
  if (attr.value.type === 'JSXExpressionContainer') return attr.value.expression;
  return attr.value;
}

function attrFromExpression(j, name, expr) {
  if (!expr) return null;
  // Wrap numeric/string/JS expressions in a JSXExpressionContainer; pass through
  // string literals as JSX string attributes when convenient is overkill — keep
  // the original shape via an expression container.
  return j.jsxAttribute(j.jsxIdentifier(name), j.jsxExpressionContainer(expr));
}

function buildShape(j, localName, typeValue, widthAttr, heightAttr) {
  const attrs = [j.jsxAttribute(j.jsxIdentifier('type'), j.stringLiteral(typeValue))];
  if (widthAttr) attrs.push(widthAttr);
  if (heightAttr) attrs.push(heightAttr);
  return j.jsxElement(j.jsxOpeningElement(jsxMember(j, localName, 'Shape'), attrs, true), null, []);
}

function buildTypography(j, localName, variant) {
  return j.jsxElement(
    j.jsxOpeningElement(
      jsxMember(j, localName, 'Typography'),
      [j.jsxAttribute(j.jsxIdentifier('typographyVariant'), j.stringLiteral(variant))],
      true,
    ),
    null,
    [],
  );
}

function findEnclosingTopLevelStatement(path) {
  let cur = path;
  while (cur.parent && cur.parent.value && cur.parent.value.type !== 'Program') {
    cur = cur.parent;
  }
  return cur.value;
}

function addLeadingTodo(j, path, message) {
  const target = findEnclosingTopLevelStatement(path);
  if (!target.comments) target.comments = [];
  const exists = target.comments.some((c) => typeof c.value === 'string' && c.value.includes(message));
  if (exists) return;
  const comment = j.commentLine(' ' + message);
  comment.leading = true;
  comment.trailing = false;
  target.comments.push(comment);
}

// --- Transformer ---

module.exports = async function transformer(fileInfo, api) {
  // Force tsx parser regardless of how the codemod is invoked so jest fixtures
  // (.js) and bin/run-codemods.js (.tsx) share the same parsing behavior.
  const j = (api.jscodeshift || jscodeshift).withParser('tsx');
  const root = j(fileInfo.source);

  // ===== Step 0: Detect kitt-universal Skeleton-related imports =====
  const kittImports = root.find(j.ImportDeclaration, {
    source: { value: '@ornikar/kitt-universal' },
  });

  let skeletonLocalName = null;
  const importedSpecifiers = { value: new Set(), type: new Set() };

  kittImports.forEach((path) => {
    const isTypeImport = path.value.importKind === 'type';
    const bucket = isTypeImport ? importedSpecifiers.type : importedSpecifiers.value;
    (path.value.specifiers || []).forEach((spec) => {
      if (spec.type !== 'ImportSpecifier') return;
      const imported = spec.imported.name;
      if (!SKELETON_IMPORT_NAMES.has(imported)) return;
      bucket.add(imported);
      if (imported === 'Skeleton' && !skeletonLocalName) {
        skeletonLocalName = spec.local ? spec.local.name : 'Skeleton';
      }
    });
  });

  const hasAnySkeletonImport = importedSpecifiers.value.size > 0 || importedSpecifiers.type.size > 0;
  if (!hasAnySkeletonImport) return fileInfo.source;

  if (!skeletonLocalName) skeletonLocalName = 'Skeleton';

  // ===== Step 1: Transform each Skeleton JSX element =====
  root.find(j.JSXElement).forEach((path) => {
    const element = path.value;
    const opening = element.openingElement;

    // <Skeleton ...> → <Skeleton.Shape type="rectangle|rounded" width? height? />
    if (isPlainSkeleton(opening, skeletonLocalName)) {
      let widthAttr = null;
      let heightAttr = null;
      let borderRadiusAttr = null;
      for (const attr of opening.attributes) {
        if (attr.type !== 'JSXAttribute') continue; // drop spreads silently
        const propName = attr.name.name;
        if (propName === 'width') widthAttr = attr;
        else if (propName === 'height') heightAttr = attr;
        else if (propName === 'borderRadius') borderRadiusAttr = attr;
        // every other prop (isLoading, style, margin, position, …) is dropped silently
      }
      const typeValue = isCircleLikeBorderRadius(borderRadiusAttr, widthAttr, heightAttr) ? 'rounded' : 'rectangle';
      const shape = buildShape(j, skeletonLocalName, typeValue, widthAttr, heightAttr);
      j(path).replaceWith(shape);
      return;
    }

    // <Skeleton.Circle size={s}> → <Skeleton.Shape type="rounded" width={s} height={s} />
    if (isSkeletonMember(opening, skeletonLocalName, 'Circle')) {
      let sizeExpr = null;
      for (const attr of opening.attributes) {
        if (attr.type !== 'JSXAttribute') continue;
        if (attr.name.name === 'size') sizeExpr = attrValueAsExpression(attr);
      }
      const widthAttr = attrFromExpression(j, 'width', sizeExpr);
      const heightAttr = attrFromExpression(j, 'height', sizeExpr);
      j(path).replaceWith(buildShape(j, skeletonLocalName, 'rounded', widthAttr, heightAttr));
      return;
    }

    // <Skeleton.Square size={s}> → <Skeleton.Shape type="rectangle" width={s} height={s} />
    if (isSkeletonMember(opening, skeletonLocalName, 'Square')) {
      let sizeExpr = null;
      for (const attr of opening.attributes) {
        if (attr.type !== 'JSXAttribute') continue;
        if (attr.name.name === 'size') sizeExpr = attrValueAsExpression(attr);
      }
      const widthAttr = attrFromExpression(j, 'width', sizeExpr);
      const heightAttr = attrFromExpression(j, 'height', sizeExpr);
      j(path).replaceWith(buildShape(j, skeletonLocalName, 'rectangle', widthAttr, heightAttr));
      return;
    }

    // <Skeleton.Bar size={s}> → <Skeleton.Typography typographyVariant="body-m" />  + TODO
    if (isSkeletonMember(opening, skeletonLocalName, 'Bar')) {
      // Stamp the TODO before replacement — we still have a live path to walk.
      addLeadingTodo(
        j,
        path,
        'TODO: [Skeleton migration] adjust `typographyVariant` on `Skeleton.Typography` to match the real text line.',
      );
      j(path).replaceWith(buildTypography(j, skeletonLocalName, 'body-m'));
    }
  });

  // ===== Step 2: Rename `SkeletonProps` identifier references (outside import specifiers) =====
  root.find(j.Identifier, { name: 'SkeletonProps' }).forEach((path) => {
    const parent = path.parent && path.parent.value;
    // Don't touch the `imported` side of an ImportSpecifier — the import rewrite below handles it.
    if (parent && parent.type === 'ImportSpecifier' && parent.imported === path.value) return;
    path.value.name = 'SkeletonShapeProps';
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
      return;
    }
    const newImport = j.importDeclaration(
      specifierNames.map((name) => j.importSpecifier(j.identifier(name))),
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
  if (importedSpecifiers.value.has('Skeleton')) valueAdds.push('Skeleton');
  if (importedSpecifiers.value.has('SkeletonProps')) valueAdds.push('SkeletonShapeProps');
  const typeAdds = [];
  if (importedSpecifiers.type.has('SkeletonProps')) typeAdds.push('SkeletonShapeProps');

  // Insert type first then value (Sticker convention; later insertion ends up first).
  addBumperImport(typeAdds, true);
  addBumperImport(valueAdds, false);

  // Remove Skeleton-related specifiers from kitt-universal imports.
  root.find(j.ImportDeclaration, { source: { value: '@ornikar/kitt-universal' } }).forEach((path) => {
    const remaining = (path.value.specifiers || []).filter(
      (spec) => spec.type !== 'ImportSpecifier' || !SKELETON_IMPORT_NAMES.has(spec.imported.name),
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
