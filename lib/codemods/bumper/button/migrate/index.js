'use strict';

/**
 * Migrates Button components from @ornikar/kitt-universal to @ornikar/bumper.
 *
 * Handles: import updates, prop transforms (variant, type, size, stretch),
 * compound component conversion (Button.Text, Button.Icon), loading pattern
 * detection (LoaderIcon + disabled → isLoading), and removal of unsupported props.
 */

const jscodeshift = require('jscodeshift');
const prettier = require('prettier');

// --- Constants ---

const PROPS_TO_REMOVE = new Set([
  'size',
  'onFocus',
  'onBlur',
  'onHoverIn',
  'onHoverOut',
  'href',
  'hrefAttrs',
  'accessibilityRole',
  'innerSpacing',
  'style',
  'isHoveredInternal',
  'isPressedInternal',
  'isFocusedInternal',
  'withBadge',
  'badgeCount',
]);

const RESPONSIVE_BREAKPOINT_MAP = {
  small: '$small',
  medium: '$medium',
  large: '$large',
  wide: '$wide',
};

const BUTTON_IMPORT_NAMES = new Set(['Button', 'ButtonProps']);

// --- Helpers ---

function isLoaderIconElement(node) {
  if (!node) return false;
  if (node.type === 'JSXElement') {
    const name = node.openingElement.name;
    return name.type === 'JSXIdentifier' && name.name === 'LoaderIcon';
  }
  return false;
}

function isFalsyNode(node) {
  if (!node) return true;
  if (node.type === 'Identifier' && node.name === 'undefined') return true;
  if (node.type === 'NullLiteral') return true;
  if (node.type === 'Literal' && node.value === null) return true;
  return false;
}

function nodesEqual(j, a, b) {
  if (!a || !b) return false;
  return j(a).toSource() === j(b).toSource();
}

function hasMeaningfulChildren(jsxElement) {
  const { children } = jsxElement;
  if (!children || children.length === 0) return false;
  return children.some((child) => {
    if (child.type === 'JSXText') return child.value.trim() !== '';
    return true;
  });
}

function isIconOnlyButton(jsxElement) {
  const { openingElement } = jsxElement;
  const hasIcon = openingElement.attributes.some((a) => a.type === 'JSXAttribute' && a.name.name === 'icon');
  if (!hasIcon) return false;
  if (openingElement.selfClosing) return true;
  return !hasMeaningfulChildren(jsxElement);
}

function isPlainButton(openingElement, buttonLocalName) {
  const name = openingElement.name;
  // Must be a plain JSXIdentifier matching the local Button name
  if (name.type === 'JSXIdentifier' && name.name === buttonLocalName) return true;
  return false;
}

function createButtonIcon(j, iconValue) {
  return j.jsxElement(
    j.jsxOpeningElement(
      j.jsxMemberExpression(j.jsxIdentifier('Button'), j.jsxIdentifier('Icon')),
      [j.jsxAttribute(j.jsxIdentifier('icon'), j.jsxExpressionContainer(iconValue))],
      true,
    ),
    null,
    [],
  );
}

function createButtonText(j, children) {
  return j.jsxElement(
    j.jsxOpeningElement(j.jsxMemberExpression(j.jsxIdentifier('Button'), j.jsxIdentifier('Text')), [], false),
    j.jsxClosingElement(j.jsxMemberExpression(j.jsxIdentifier('Button'), j.jsxIdentifier('Text'))),
    children,
  );
}

function createMediaPropAttribute(j, mediaPropName, propName, valueNode) {
  return j.jsxAttribute(
    j.jsxIdentifier(mediaPropName),
    j.jsxExpressionContainer(j.objectExpression([j.property('init', j.identifier(propName), valueNode)])),
  );
}

// --- Transformer ---

module.exports = async function transformer(fileInfo, api) {
  const j = api.jscodeshift || jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;

  // ===== Step 0: Check for Button/ButtonProps imports from kitt-universal =====
  const kittImports = root.find(j.ImportDeclaration, {
    source: { value: '@ornikar/kitt-universal' },
  });

  const kittTypeImports = root.find(j.ImportDeclaration, {
    source: { value: '@ornikar/kitt-universal' },
    importKind: 'type',
  });

  let buttonLocalName = null;
  let hasButtonImport = false;
  let hasButtonPropsValueImport = false;
  let hasButtonPropsTypeImport = false;

  kittImports.forEach((path) => {
    const isTypeImport = path.value.importKind === 'type';
    const specifiers = path.value.specifiers || [];
    specifiers.forEach((spec) => {
      if (spec.type === 'ImportSpecifier') {
        if (spec.imported.name === 'Button') {
          buttonLocalName = spec.local ? spec.local.name : 'Button';
          hasButtonImport = true;
        }
        if (spec.imported.name === 'ButtonProps') {
          if (isTypeImport) {
            hasButtonPropsTypeImport = true;
          } else {
            hasButtonPropsValueImport = true;
          }
        }
      }
    });
  });

  const hasButtonPropsImport = hasButtonPropsValueImport || hasButtonPropsTypeImport;
  if (!hasButtonImport && !hasButtonPropsImport) {
    return fileInfo.source;
  }

  // Use 'Button' as default local name if only ButtonProps was imported
  if (!buttonLocalName) buttonLocalName = 'Button';

  let buttonsTransformed = 0;

  // ===== Step 1-4: Transform each Button JSXElement =====
  root.find(j.JSXElement).forEach((path) => {
    const element = path.value;
    const openingElement = element.openingElement;

    if (!isPlainButton(openingElement, buttonLocalName)) return;
    if (isIconOnlyButton(element)) return;

    // --- Step 2: Detect loading pattern ---
    let loadingCondition = null;
    let fallbackIcon = null;
    let isLoadingDetected = false;

    const iconAttr = openingElement.attributes.find((a) => a.type === 'JSXAttribute' && a.name.name === 'icon');
    const disabledAttr = openingElement.attributes.find((a) => a.type === 'JSXAttribute' && a.name.name === 'disabled');

    if (iconAttr && iconAttr.value && iconAttr.value.type === 'JSXExpressionContainer') {
      const expr = iconAttr.value.expression;
      if (expr.type === 'ConditionalExpression') {
        if (isLoaderIconElement(expr.consequent)) {
          loadingCondition = expr.test;
          fallbackIcon = isFalsyNode(expr.alternate) ? null : expr.alternate;
        } else if (isLoaderIconElement(expr.alternate)) {
          loadingCondition = j.unaryExpression('!', expr.test);
          fallbackIcon = isFalsyNode(expr.consequent) ? null : expr.consequent;
        }
      }
    }

    // Match loading condition against disabled prop
    if (loadingCondition && disabledAttr && disabledAttr.value) {
      const disabledExpr = disabledAttr.value.type === 'JSXExpressionContainer' ? disabledAttr.value.expression : null;

      if (disabledExpr && nodesEqual(j, disabledExpr, loadingCondition)) {
        isLoadingDetected = true;
      } else if (disabledExpr && disabledExpr.type === 'LogicalExpression' && disabledExpr.operator === '||') {
        if (nodesEqual(j, disabledExpr.left, loadingCondition)) {
          isLoadingDetected = true;
        } else if (nodesEqual(j, disabledExpr.right, loadingCondition)) {
          isLoadingDetected = true;
        }
      }
    }

    // --- Step 3: Transform props ---
    const newAttrs = [];
    let iconValue = null;
    let iconPosition = 'left';
    let isLoadingPlaced = false;
    let hasTodoTimerAttrs = false;

    for (const attr of openingElement.attributes) {
      if (attr.type !== 'JSXAttribute') {
        newAttrs.push(attr);
        continue;
      }

      const propName = attr.name.name;

      // Remove props
      if (PROPS_TO_REMOVE.has(propName)) {
        continue;
      }

      // iconPosition → record value, then remove
      if (propName === 'iconPosition') {
        if (attr.value) {
          const val = attr.value;
          if ((val.type === 'StringLiteral' || val.type === 'Literal') && val.value === 'right') {
            iconPosition = 'right';
          }
        }
        continue;
      }

      // icon prop → record and remove
      if (propName === 'icon') {
        if (isLoadingDetected) {
          // Extract the fallback icon (non-LoaderIcon) from the ternary
          if (fallbackIcon) {
            iconValue = fallbackIcon;
          }
          // If no fallback, iconValue stays null (no Button.Icon needed)
        } else if (attr.value) {
          iconValue = attr.value.type === 'JSXExpressionContainer' ? attr.value.expression : attr.value;
        }
        continue;
      }

      // disabled — handle loading pattern extraction
      if (propName === 'disabled' && isLoadingDetected) {
        const isLoadingAttr = j.jsxAttribute(j.jsxIdentifier('isLoading'), j.jsxExpressionContainer(loadingCondition));
        const disabledExpr = attr.value && attr.value.type === 'JSXExpressionContainer' ? attr.value.expression : null;

        if (disabledExpr && nodesEqual(j, disabledExpr, loadingCondition)) {
          // Entire disabled was the loading condition — replace with isLoading
          newAttrs.push(isLoadingAttr);
          isLoadingPlaced = true;
          continue;
        } else if (disabledExpr && disabledExpr.type === 'LogicalExpression' && disabledExpr.operator === '||') {
          // Extract non-loading part, keep disabled + add isLoading
          if (nodesEqual(j, disabledExpr.left, loadingCondition)) {
            attr.value = j.jsxExpressionContainer(disabledExpr.right);
            newAttrs.push(attr);
          } else if (nodesEqual(j, disabledExpr.right, loadingCondition)) {
            attr.value = j.jsxExpressionContainer(disabledExpr.left);
            newAttrs.push(attr);
          } else {
            newAttrs.push(attr);
          }
          newAttrs.push(isLoadingAttr);
          isLoadingPlaced = true;
          continue;
        }
        newAttrs.push(attr);
        continue;
      }

      // variant
      if (propName === 'variant') {
        if (attr.value) {
          const val = attr.value;
          // String literal
          if ((val.type === 'StringLiteral' || val.type === 'Literal') && val.value === 'default') {
            continue; // Remove variant="default"
          }
          if ((val.type === 'StringLiteral' || val.type === 'Literal') && val.value === 'revert') {
            newAttrs.push(j.jsxAttribute(j.jsxIdentifier('isOnContrasted')));
            continue;
          }
          // Dynamic expression: variant={expr} → isOnContrasted={expr === 'revert'} won't work directly
          // For ternary like {isContrasted ? 'revert' : 'default'} → isOnContrasted={isContrasted}
          if (val.type === 'JSXExpressionContainer') {
            const expr = val.expression;
            if (
              expr.type === 'ConditionalExpression' &&
              ((expr.consequent.value === 'revert' && expr.alternate.value === 'default') ||
                (expr.consequent.value === 'default' && expr.alternate.value === 'revert'))
            ) {
              const condition = expr.consequent.value === 'revert' ? expr.test : j.unaryExpression('!', expr.test);
              newAttrs.push(j.jsxAttribute(j.jsxIdentifier('isOnContrasted'), j.jsxExpressionContainer(condition)));
            } else {
              // Generic: isOnContrasted={expr === 'revert'}
              newAttrs.push(
                j.jsxAttribute(
                  j.jsxIdentifier('isOnContrasted'),
                  j.jsxExpressionContainer(j.binaryExpression('===', expr, j.stringLiteral('revert'))),
                ),
              );
            }
            continue;
          }
        }
        continue;
      }

      // type="tertiary-danger" → type="danger"
      if (propName === 'type' && attr.value) {
        if (
          (attr.value.type === 'StringLiteral' || attr.value.type === 'Literal') &&
          attr.value.value === 'tertiary-danger'
        ) {
          attr.value = j.stringLiteral('danger');
        }
        newAttrs.push(attr);
        continue;
      }

      // stretch
      if (propName === 'stretch') {
        // Bare boolean prop: stretch (no value) → keep as-is
        if (!attr.value) {
          newAttrs.push(attr);
          continue;
        }

        if (attr.value.type === 'JSXExpressionContainer') {
          const expr = attr.value.expression;

          // stretch={true} → bare stretch
          if (
            (expr.type === 'BooleanLiteral' && expr.value === true) ||
            (expr.type === 'Literal' && expr.value === true)
          ) {
            newAttrs.push(j.jsxAttribute(j.jsxIdentifier('stretch')));
            continue;
          }

          // stretch={false} → remove
          if (
            (expr.type === 'BooleanLiteral' && expr.value === false) ||
            (expr.type === 'Literal' && expr.value === false)
          ) {
            continue;
          }

          // stretch={{ base: X, breakpoint: Y }}
          if (expr.type === 'ObjectExpression') {
            let baseValue = null;
            for (const prop of expr.properties) {
              if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
              const key = prop.key.name || prop.key.value;

              if (key === 'base') {
                baseValue = prop.value;
              } else if (RESPONSIVE_BREAKPOINT_MAP[key]) {
                newAttrs.push(createMediaPropAttribute(j, RESPONSIVE_BREAKPOINT_MAP[key], 'stretch', prop.value));
              }
            }

            // Add base stretch prop
            if (baseValue) {
              if (
                (baseValue.type === 'BooleanLiteral' && baseValue.value === true) ||
                (baseValue.type === 'Literal' && baseValue.value === true)
              ) {
                newAttrs.unshift(j.jsxAttribute(j.jsxIdentifier('stretch')));
              } else if (
                (baseValue.type === 'BooleanLiteral' && baseValue.value === false) ||
                (baseValue.type === 'Literal' && baseValue.value === false)
              ) {
                // base is false, don't add stretch prop
              } else {
                newAttrs.unshift(j.jsxAttribute(j.jsxIdentifier('stretch'), j.jsxExpressionContainer(baseValue)));
              }
            }
            continue;
          }

          // stretch={variable} → keep + TODO (dynamic, can't convert mechanically)
          // TODO comment will be added at the element level below
          newAttrs.push(attr);
          continue;
        }

        newAttrs.push(attr);
        continue;
      }

      // timerAttrs → remove + flag for TODO
      if (propName === 'timerAttrs') {
        hasTodoTimerAttrs = true;
        continue;
      }

      // Keep all other props
      newAttrs.push(attr);
    }

    // Add isLoading prop if detected but not yet placed (fallback)
    if (isLoadingDetected && !isLoadingPlaced) {
      newAttrs.push(j.jsxAttribute(j.jsxIdentifier('isLoading'), j.jsxExpressionContainer(loadingCondition)));
    }

    openingElement.attributes = newAttrs;
    buttonsTransformed++;

    // --- Step 4: Restructure children to compound pattern ---
    const existingChildren = hasMeaningfulChildren(element)
      ? element.children.filter((child) => {
          if (child.type === 'JSXText') return child.value.trim() !== '';
          return true;
        })
      : [];

    const newChildren = [];

    // Add icon (left position)
    if (iconValue && iconPosition === 'left') {
      newChildren.push(j.jsxText('\n'));
      newChildren.push(createButtonIcon(j, iconValue));
    }

    // Wrap text children in Button.Text
    if (existingChildren.length > 0) {
      newChildren.push(j.jsxText('\n'));
      newChildren.push(createButtonText(j, existingChildren));
    }

    // Add icon (right position)
    if (iconValue && iconPosition === 'right') {
      newChildren.push(j.jsxText('\n'));
      newChildren.push(createButtonIcon(j, iconValue));
    }

    if (newChildren.length > 0) {
      newChildren.push(j.jsxText('\n'));
    }

    element.children = newChildren;
    openingElement.selfClosing = false;
    if (!element.closingElement) {
      element.closingElement = j.jsxClosingElement(j.jsxIdentifier(buttonLocalName));
    }

    // Add TODO comment for timerAttrs
    if (hasTodoTimerAttrs) {
      // Find the parent statement to attach the comment
      let current = path;
      while (
        current.parent &&
        current.parent.value.type !== 'Program' &&
        current.parent.value.type !== 'BlockStatement' &&
        current.parent.value.type !== 'ReturnStatement'
      ) {
        current = current.parent;
      }
      // Add comment to the return statement or the function containing this JSX
      const targetNode =
        current.parent && current.parent.value.type === 'ReturnStatement' ? current.parent.value : current.value;
      if (!targetNode.comments) targetNode.comments = [];
      const comment = j.commentLine(
        ' TODO: [Button migration] timerAttrs has no bumper equivalent. Manual conversion required.',
      );
      comment.leading = true;
      targetNode.comments.push(comment);
    }
  });

  // ===== Step 5: Handle imports =====
  // Only move imports if we actually transformed at least one Button element,
  // or if only ButtonProps was imported (type-only migration).
  const shouldMoveImports = buttonsTransformed > 0 || (!hasButtonImport && hasButtonPropsImport);

  if (!shouldMoveImports) {
    return fileInfo.source;
  }

  hasChanges = true;

  // Collect specifiers to add to bumper value import
  const bumperValueSpecifiers = [];
  if (hasButtonImport) {
    bumperValueSpecifiers.push('Button');
  }
  if (hasButtonPropsValueImport) {
    bumperValueSpecifiers.push('ButtonProps');
  }

  // Add value specifiers to bumper import
  if (bumperValueSpecifiers.length > 0) {
    const allBumperImports = root
      .find(j.ImportDeclaration, {
        source: { value: '@ornikar/bumper' },
      })
      .filter((p) => !p.value.importKind || p.value.importKind === 'value');

    if (allBumperImports.length > 0) {
      const bumperImport = allBumperImports.at(0).get();
      for (const name of bumperValueSpecifiers) {
        const already = bumperImport.value.specifiers.some(
          (s) => s.type === 'ImportSpecifier' && s.imported.name === name,
        );
        if (!already) {
          bumperImport.value.specifiers.push(j.importSpecifier(j.identifier(name)));
        }
      }
    } else {
      const newImport = j.importDeclaration(
        bumperValueSpecifiers.map((name) => j.importSpecifier(j.identifier(name))),
        j.literal('@ornikar/bumper'),
      );
      const allKittImports = root.find(j.ImportDeclaration, {
        source: { value: '@ornikar/kitt-universal' },
      });
      if (allKittImports.length > 0) {
        allKittImports.at(allKittImports.length - 1).insertAfter(newImport);
      } else {
        const body = root.find(j.Program).get().value.body;
        body.unshift(newImport);
      }
    }
  }

  // Add ButtonProps to bumper type import (only if it was a type-only import)
  if (hasButtonPropsTypeImport) {
    const bumperTypeImports = root.find(j.ImportDeclaration, {
      source: { value: '@ornikar/bumper' },
      importKind: 'type',
    });

    if (bumperTypeImports.length > 0) {
      const bumperTypeImport = bumperTypeImports.at(0).get();
      const hasButtonProps = bumperTypeImport.value.specifiers.some(
        (s) => s.type === 'ImportSpecifier' && s.imported.name === 'ButtonProps',
      );
      if (!hasButtonProps) {
        bumperTypeImport.value.specifiers.push(j.importSpecifier(j.identifier('ButtonProps')));
      }
    } else {
      const newTypeImport = j.importDeclaration(
        [j.importSpecifier(j.identifier('ButtonProps'))],
        j.literal('@ornikar/bumper'),
      );
      newTypeImport.importKind = 'type';
      const allKittImports = root.find(j.ImportDeclaration, {
        source: { value: '@ornikar/kitt-universal' },
      });
      if (allKittImports.length > 0) {
        allKittImports.at(allKittImports.length - 1).insertAfter(newTypeImport);
      }
    }
  }

  // Remove Button/ButtonProps specifiers from kitt-universal imports
  root
    .find(j.ImportDeclaration, {
      source: { value: '@ornikar/kitt-universal' },
    })
    .forEach((path) => {
      const remaining = (path.value.specifiers || []).filter(
        (spec) => spec.type !== 'ImportSpecifier' || !BUTTON_IMPORT_NAMES.has(spec.imported.name),
      );
      if (remaining.length > 0) {
        path.value.specifiers = remaining;
      } else {
        j(path).remove();
      }
    });

  // Remove LoaderIcon import if no longer used
  const loaderIconUsages = root.find(j.JSXIdentifier, { name: 'LoaderIcon' });
  const loaderIconExprUsages = root.find(j.Identifier, { name: 'LoaderIcon' }).filter((p) => {
    return p.parent.value.type !== 'ImportSpecifier';
  });

  if (loaderIconUsages.length === 0 && loaderIconExprUsages.length === 0) {
    root.find(j.ImportDeclaration).forEach((path) => {
      const specifiers = path.value.specifiers || [];
      const loaderIdx = specifiers.findIndex((s) => s.type === 'ImportSpecifier' && s.imported.name === 'LoaderIcon');
      if (loaderIdx !== -1) {
        specifiers.splice(loaderIdx, 1);
        if (specifiers.length === 0) {
          j(path).remove();
        }
      }
    });
  }

  if (!hasChanges) return fileInfo.source;

  const output = root.toSource({ quote: 'single' });
  const prettierConfig = await prettier.resolveConfig(fileInfo.path);

  return prettier.format(output, {
    ...prettierConfig,
    filepath: fileInfo.path,
  });
};
