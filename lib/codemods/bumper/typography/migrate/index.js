'use strict';

/**
 * Migrates Typography components from @ornikar/kitt-universal to @ornikar/bumper.
 *
 * Handles: import updates, component renames, prop transforms (base→variant,
 * variant→weight, color mapping, responsive breakpoints, boolean props,
 * platform props, icon sizes).
 */

const jscodeshift = require('jscodeshift');
const prettier = require('prettier');

// --- Value mappings ---

const VARIANT_VALUE_MAP = {
  'heading-xxs': 'heading-2xs',
  'heading-xxl': 'heading-2xl',
  'label-small': 'label-s',
  'label-medium': 'label-m',
  'label-large': 'label-l',
  'content-caps-xxl': 'content-caps-2xl',
  'content-caps-xxxl': 'content-caps-3xl',
};

const COLOR_MAP = {
  black: '$content.base.hi',
  'black-anthracite': '$content.base.hi',
  'black-disabled': '$content.disabled',
  'black-light': '$content.base.mid',
  white: '$content.base.onContrasted.hi',
  'white-light': '$content.base.onContrasted.mid',
  primary: '$content.accent',
  'primary-light': '$content.accent',
  accent: '$content.accent',
  success: '$content.success',
  danger: '$content.danger',
  warning: '$content.warning',
};

const ICON_SIZE_MAP = {
  16: '$icon.s',
  20: '$icon.m',
  24: '$icon.l',
};

// kitt-u breakpoint props → bumper breakpoint props
const RESPONSIVE_BREAKPOINT_MAP = {
  small: '$small',
  medium: '$medium',
  large: '$large',
  wide: '$wide',
};

const PLATFORM_PROP_MAP = {
  _web: '$platform-web',
  _ios: '$platform-native',
  _android: '$platform-native',
};

const TYPOGRAPHY_IMPORT_NAMES = new Set(['Typography', 'TypographyLink', 'TypographyIcon', 'TypographyEmoji']);

// --- Helpers ---

function mapVariantValue(value) {
  return VARIANT_VALUE_MAP[value] || value;
}

function mapColorValue(value) {
  if (typeof value === 'string' && value.startsWith('kitt.bumper.')) {
    return '$' + value.slice('kitt.bumper.'.length);
  }
  return COLOR_MAP[value] || value;
}

function mapStringLiteralValue(node, mapFn) {
  if (!node) return false;
  if (node.type === 'StringLiteral' || node.type === 'Literal') {
    const mapped = mapFn(node.value);
    if (mapped !== node.value) {
      node.value = mapped;
      return true;
    }
  }
  return false;
}

function isTypographyMemberExpr(node) {
  return (
    node.type === 'JSXMemberExpression' && node.object.type === 'JSXIdentifier' && node.object.name === 'Typography'
  );
}

function getTypographyComponentType(openingElement) {
  const name = openingElement.name;
  if (name.type === 'JSXIdentifier') {
    if (name.name === 'TypographyLink') return 'link';
    if (name.name === 'TypographyIcon') return 'icon';
    return null;
  }
  if (isTypographyMemberExpr(name)) {
    const sub = name.property.name;
    if (sub === 'Icon') return 'icon';
    if (sub === 'Link') return 'link';
    if (sub === 'Text' || sub === 'Paragraph' || /^Header[1-6]$/.test(sub)) {
      return 'text';
    }
    if (sub === 'SetDefaultColor') return 'setDefaultColor';
    return null;
  }
  return null;
}

function createMediaPropAttribute(j, mediaPropName, valueNode) {
  return j.jsxAttribute(
    j.jsxIdentifier(mediaPropName),
    j.jsxExpressionContainer(j.objectExpression([j.property('init', j.identifier('variant'), valueNode)])),
  );
}

// --- Transformer ---

module.exports = async function transformer(fileInfo, api) {
  const j = api.jscodeshift || jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;

  // ===== Step 1: Handle imports =====
  const kittImports = root.find(j.ImportDeclaration, {
    source: { value: '@ornikar/kitt-universal' },
  });

  let needsTypographyImport = false;
  const typographySpecNames = new Set();

  kittImports.forEach((path) => {
    const specifiers = path.value.specifiers || [];
    specifiers.forEach((spec) => {
      if (spec.type === 'ImportSpecifier' && TYPOGRAPHY_IMPORT_NAMES.has(spec.imported.name)) {
        typographySpecNames.add(spec.imported.name);
        if (spec.imported.name !== 'TypographyEmoji') {
          needsTypographyImport = true;
        }
      }
    });
  });

  // If no Typography-related imports from kitt-universal, nothing to migrate.
  if (typographySpecNames.size === 0) {
    return fileInfo.source;
  }

  hasChanges = true;

  // Add Typography to bumper import
  if (needsTypographyImport) {
    const bumperImports = root.find(j.ImportDeclaration, {
      source: { value: '@ornikar/bumper' },
    });

    if (bumperImports.length > 0) {
      const bumperImport = bumperImports.at(0).get();
      const hasTypography = bumperImport.value.specifiers.some(
        (s) => s.type === 'ImportSpecifier' && s.imported.name === 'Typography',
      );
      if (!hasTypography) {
        bumperImport.value.specifiers.push(j.importSpecifier(j.identifier('Typography')));
      }
    } else {
      const newImport = j.importDeclaration(
        [j.importSpecifier(j.identifier('Typography'))],
        j.literal('@ornikar/bumper'),
      );
      kittImports.at(kittImports.length - 1).insertAfter(newImport);
    }
  }

  // Remove typography specifiers from kitt-universal imports, or remove entire import
  kittImports.forEach((path) => {
    const remaining = (path.value.specifiers || []).filter(
      (spec) => spec.type !== 'ImportSpecifier' || !TYPOGRAPHY_IMPORT_NAMES.has(spec.imported.name),
    );
    if (remaining.length > 0) {
      path.value.specifiers = remaining;
    } else {
      j(path).remove();
    }
  });

  // ===== Step 2: Rename TypographyLink → Typography.Link (JSX + expressions) =====
  root.find(j.JSXIdentifier, { name: 'TypographyLink' }).forEach((path) => {
    const parent = path.parent.value;
    if (parent.type === 'JSXOpeningElement' || parent.type === 'JSXClosingElement') {
      j(path).replaceWith(j.jsxMemberExpression(j.jsxIdentifier('Typography'), j.jsxIdentifier('Link')));
      hasChanges = true;
    }
  });

  // Handle expression references: e.g. as={TypographyLink}
  root.find(j.Identifier, { name: 'TypographyLink' }).forEach((path) => {
    if (path.parent.value.type === 'ImportSpecifier') return;
    j(path).replaceWith(j.memberExpression(j.identifier('Typography'), j.identifier('Link')));
    hasChanges = true;
  });

  // ===== Step 3: Rename TypographyIcon → Typography.Icon (JSX + expressions) =====
  root.find(j.JSXIdentifier, { name: 'TypographyIcon' }).forEach((path) => {
    const parent = path.parent.value;
    if (parent.type === 'JSXOpeningElement' || parent.type === 'JSXClosingElement') {
      j(path).replaceWith(j.jsxMemberExpression(j.jsxIdentifier('Typography'), j.jsxIdentifier('Icon')));
      hasChanges = true;
    }
  });

  root.find(j.Identifier, { name: 'TypographyIcon' }).forEach((path) => {
    if (path.parent.value.type === 'ImportSpecifier') return;
    j(path).replaceWith(j.memberExpression(j.identifier('Typography'), j.identifier('Icon')));
    hasChanges = true;
  });

  // ===== Step 4: Rename Typography.Paragraph → Typography.Text =====
  root
    .find(j.JSXMemberExpression, {
      object: { name: 'Typography' },
      property: { name: 'Paragraph' },
    })
    .forEach((path) => {
      path.value.property.name = 'Text';
      hasChanges = true;
    });

  // ===== Step 5: Transform props on Typography components =====
  root.find(j.JSXOpeningElement).forEach((path) => {
    const openingElement = path.value;
    const compType = getTypographyComponentType(openingElement);
    if (!compType) return;

    const isIcon = compType === 'icon';
    const newAttrs = [];
    let elementChanged = false;

    for (const attr of openingElement.attributes) {
      if (attr.type !== 'JSXAttribute') {
        newAttrs.push(attr);
        continue;
      }

      const propName = attr.name.name;

      // --- Remove accessibilityRole ---
      if (propName === 'accessibilityRole') {
        elementChanged = true;
        continue;
      }

      // --- Icon: color="inherit" → remove ---
      if (isIcon && propName === 'color') {
        if (
          attr.value &&
          (attr.value.type === 'StringLiteral' || attr.value.type === 'Literal') &&
          attr.value.value === 'inherit'
        ) {
          elementChanged = true;
          continue;
        }
      }

      // --- Icon: size numeric → token ---
      if (isIcon && propName === 'size' && attr.value) {
        if (attr.value.type === 'JSXExpressionContainer' && attr.value.expression) {
          const expr = attr.value.expression;
          if ((expr.type === 'NumericLiteral' || expr.type === 'Literal') && typeof expr.value === 'number') {
            const mapped = ICON_SIZE_MAP[expr.value];
            if (mapped) {
              attr.value = j.stringLiteral(mapped);
              elementChanged = true;
            }
          }
        }
        newAttrs.push(attr);
        continue;
      }

      // --- Rename base → variant (with value mapping) ---
      if (propName === 'base') {
        attr.name.name = 'variant';
        if (attr.value) {
          if (mapStringLiteralValue(attr.value, mapVariantValue)) {
            elementChanged = true;
          }
        }
        elementChanged = true;
        newAttrs.push(attr);
        continue;
      }

      // --- Rename variant → weight (remove semibold) ---
      if (propName === 'variant' && !isIcon) {
        if (
          attr.value &&
          (attr.value.type === 'StringLiteral' || attr.value.type === 'Literal') &&
          attr.value.value === 'semibold'
        ) {
          elementChanged = true;
          continue;
        }
        attr.name.name = 'weight';
        elementChanged = true;
        newAttrs.push(attr);
        continue;
      }

      // --- Color mapping ---
      if (propName === 'color' && attr.value) {
        if (mapStringLiteralValue(attr.value, mapColorValue)) {
          elementChanged = true;
        }
        newAttrs.push(attr);
        continue;
      }

      // --- underline → textDecorationLine="underline" ---
      if (propName === 'underline') {
        newAttrs.push(j.jsxAttribute(j.jsxIdentifier('textDecorationLine'), j.stringLiteral('underline')));
        elementChanged = true;
        continue;
      }

      // --- strikeThrough → textDecorationLine="line-through" ---
      if (propName === 'strikeThrough') {
        newAttrs.push(j.jsxAttribute(j.jsxIdentifier('textDecorationLine'), j.stringLiteral('line-through')));
        elementChanged = true;
        continue;
      }

      // --- Platform props ---
      if (PLATFORM_PROP_MAP[propName]) {
        attr.name.name = PLATFORM_PROP_MAP[propName];
        elementChanged = true;
        newAttrs.push(attr);
        continue;
      }

      // --- Responsive shorthand: small/medium/large/wide → $small/$medium/$large/$wide ---
      if (RESPONSIVE_BREAKPOINT_MAP[propName]) {
        const mediaPropName = RESPONSIVE_BREAKPOINT_MAP[propName];
        let valueNode;
        if (attr.value && (attr.value.type === 'StringLiteral' || attr.value.type === 'Literal')) {
          valueNode = j.stringLiteral(mapVariantValue(attr.value.value));
        } else if (attr.value && attr.value.type === 'JSXExpressionContainer') {
          valueNode = attr.value.expression;
        } else {
          valueNode = attr.value;
        }
        newAttrs.push(createMediaPropAttribute(j, mediaPropName, valueNode));
        elementChanged = true;
        continue;
      }

      // --- type object → variant + media props ---
      if (propName === 'type' && attr.value && attr.value.type === 'JSXExpressionContainer') {
        const expr = attr.value.expression;
        if (expr.type === 'ObjectExpression') {
          for (const prop of expr.properties) {
            if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
            const key = prop.key.name || prop.key.value;
            let propValueNode = prop.value;

            if (propValueNode.type === 'StringLiteral' || propValueNode.type === 'Literal') {
              propValueNode = j.stringLiteral(mapVariantValue(propValueNode.value));
            }

            if (key === 'base') {
              newAttrs.push(j.jsxAttribute(j.jsxIdentifier('variant'), propValueNode));
            } else if (RESPONSIVE_BREAKPOINT_MAP[key]) {
              newAttrs.push(createMediaPropAttribute(j, RESPONSIVE_BREAKPOINT_MAP[key], propValueNode));
            }
          }
          elementChanged = true;
          continue;
        }
      }

      // --- Remove href/hrefAttrs on Typography.Link ---
      if ((propName === 'href' || propName === 'hrefAttrs') && compType === 'link') {
        elementChanged = true;
        continue;
      }

      newAttrs.push(attr);
    }

    if (elementChanged) {
      openingElement.attributes = newAttrs;
      hasChanges = true;
    }
  });

  if (!hasChanges) return fileInfo.source;

  const output = root.toSource({ quote: 'single' });
  const prettierConfig = await prettier.resolveConfig(fileInfo.path);

  return prettier.format(output, {
    ...prettierConfig,
    filepath: fileInfo.path,
  });
};
