'use strict';

/**
 * Transforms FullscreenModal components from prop-based structure to children-based structure.
 * Converts header, body, and footer props into direct children, maintaining proper order.
 */

// Use local jscodeshift instance directly
const jscodeshift = require('jscodeshift');
const prettier = require('prettier');

module.exports = async function transformer(fileInfo, api) {
  // Use the jscodeshift API to parse the file
  const j = api.jscodeshift || jscodeshift;

  // Parse the source code of the file
  const root = j(fileInfo.source);

  // ----------- Start of codemod logic

  let hasChanges = false;

  // Find all FullscreenModal JSX elements
  root
    .find(j.JSXElement, {
      openingElement: {
        name: {
          name: 'FullscreenModal',
        },
      },
    })
    .forEach((path) => {
      const element = path.value;
      const openingElement = element.openingElement;

      // Check if this FullscreenModal has header, body, or footer props
      const headerProp = openingElement.attributes.find(
        (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'header',
      );
      const bodyProp = openingElement.attributes.find(
        (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'body',
      );
      const footerProp = openingElement.attributes.find(
        (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'footer',
      );

      // Only transform if at least one of these props exists
      if (!headerProp && !bodyProp && !footerProp) {
        return;
      }

      hasChanges = true;

      // Extract the prop values and create children
      const children = [];

      // Helper function to extract content from prop value
      const extractPropContent = (prop) => {
        if (!prop || !prop.value) return [];

        if (prop.value.type === 'JSXExpressionContainer') {
          const expression = prop.value.expression;

          // Check if the expression is a FullscreenModal.Body - if so, keep the element
          if (
            expression.type === 'JSXElement' &&
            expression.openingElement.name.type === 'JSXMemberExpression' &&
            expression.openingElement.name.object.name === 'FullscreenModal' &&
            expression.openingElement.name.property.name === 'Body'
          ) {
            // Return the FullscreenModal.Body element itself
            return [expression];
          } else if (expression.type === 'JSXElement') {
            // For other JSX elements (header, footer), return the element directly (not wrapped)
            return [expression];
          } else {
            // For other expressions (including conditionals), return as JSX expression
            return [j.jsxExpressionContainer(expression)];
          }
        } else if (prop.value.type === 'JSXElement') {
          // Direct JSX element
          if (
            prop.value.openingElement.name.type === 'JSXMemberExpression' &&
            prop.value.openingElement.name.object.name === 'FullscreenModal' &&
            prop.value.openingElement.name.property.name === 'Body'
          ) {
            // Direct FullscreenModal.Body element - return the element itself
            return [prop.value];
          } else {
            // For other direct JSX elements (like FullscreenModal.Header, FullscreenModal.Footer), return as-is
            return [prop.value];
          }
        } else {
          // For other types, return as-is
          return [prop.value];
        }
      };

      // Add header first
      if (headerProp) {
        const headerContent = extractPropContent(headerProp);
        children.push(...headerContent);
      }

      // Add body second
      if (bodyProp) {
        const bodyContent = extractPropContent(bodyProp);
        children.push(...bodyContent);
      }

      // Add footer last
      if (footerProp) {
        const footerContent = extractPropContent(footerProp);
        children.push(...footerContent);
      }

      // Remove the header, body, and footer props from attributes
      openingElement.attributes = openingElement.attributes.filter((attr) => {
        return !(
          attr.type === 'JSXAttribute' &&
          (attr.name.name === 'header' || attr.name.name === 'body' || attr.name.name === 'footer')
        );
      });

      // Update the element to be self-closing if no children, or add children
      if (children.length === 0) {
        openingElement.selfClosing = true;
        element.closingElement = null;
        element.children = [];
      } else {
        openingElement.selfClosing = false;
        if (!element.closingElement) {
          element.closingElement = j.jsxClosingElement(j.jsxIdentifier('FullscreenModal'));
        }
        element.children = children;
      }
    });

  // Only return modified code if changes were made
  if (!hasChanges) {
    return fileInfo.source;
  }

  // ----------- End of codemod logic

  // Return the modified source code after transformation
  const output = root.toSource({ quote: 'single' });

  const prettierConfig = await prettier.resolveConfig(fileInfo.path);

  return prettier.format(output, {
    ...prettierConfig,
    filepath: fileInfo.path,
  });
};
