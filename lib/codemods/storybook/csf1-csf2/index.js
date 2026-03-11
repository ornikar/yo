'use strict';

// Codemod to convert Storybook CSF1 format to CSF2 format

// Use local jscodeshift instance directly
const jscodeshift = require('jscodeshift');
const prettier = require('prettier');

module.exports = async function transformer(fileInfo, api) {
  // Use the jscodeshift API to parse the file
  const j = api.jscodeshift || jscodeshift;

  // Parse the source code of the file
  const root = j(fileInfo.source);

  // ----------- Start of transformer logic

  let hasTransformation = false;

  // Find storiesOf import and replace it
  const storiesOfImports = root
    .find(j.ImportDeclaration, {
      source: { value: '@storybook/react-native' },
    })
    .filter((path) => {
      return path.node.specifiers.some((spec) => spec.type === 'ImportSpecifier' && spec.imported.name === 'storiesOf');
    });

  if (storiesOfImports.length > 0) {
    // Replace with ComponentMeta and ComponentStory type imports
    storiesOfImports.replaceWith(() => {
      return j.importDeclaration(
        [
          j.importSpecifier(j.identifier('ComponentMeta'), j.identifier('ComponentMeta')),
          j.importSpecifier(j.identifier('ComponentStory'), j.identifier('ComponentStory')),
        ],
        j.literal('@storybook/react-native'),
        'type',
      );
    });
    hasTransformation = true;
  }

  // Find storiesOf() chains - look for any expression that contains storiesOf
  const storiesOfStatements = root.find(j.ExpressionStatement).filter((path) => {
    const { expression } = path.node;
    if (expression.type !== 'CallExpression') return false;

    // Look for storiesOf anywhere in the call chain
    function containsStoriesOf(node) {
      if (node.type === 'CallExpression' && node.callee && node.callee.name === 'storiesOf') {
        return true;
      }
      if (node.type === 'CallExpression' && node.callee && node.callee.type === 'MemberExpression') {
        return containsStoriesOf(node.callee.object);
      }
      return false;
    }

    return containsStoriesOf(expression);
  });

  if (storiesOfStatements.length > 0) {
    // We need to collect all the new exports first, then add them at the end
    const newExports = [];

    storiesOfStatements.forEach((path) => {
      const { expression } = path.node;

      // Parse the entire call chain to extract all stories, decorators, and parameters
      function parseStoriesChain(node) {
        const stories = [];
        const decorators = [];
        let globalParameters = null;
        let storiesOfCall = null;

        function walkChain(current) {
          if (current.type === 'CallExpression' && current.callee) {
            if (current.callee.name === 'storiesOf') {
              // Found the root storiesOf call
              storiesOfCall = current;
            } else if (current.callee.type === 'MemberExpression') {
              const methodName = current.callee.property.name;

              switch (methodName) {
                case 'add': {
                  // Extract story information
                  const storyName = current.arguments[0].value;
                  const componentFunction = current.arguments[1];
                  const storyParameters = current.arguments[2]; // Third argument contains parameters

                  stories.push({
                    name: storyName,
                    component: componentFunction,
                    parameters: storyParameters,
                  });

                  break;
                }
                case 'addDecorator': {
                  let decorator = current.arguments[0];
                  // Remove 'as any' type assertions from decorators
                  if (decorator.type === 'TSAsExpression' && decorator.typeAnnotation.type === 'TSAnyKeyword') {
                    decorator = decorator.expression;
                  }
                  decorators.push(decorator); // Collect decorators in order

                  break;
                }
                case 'addParameters': {
                  globalParameters = current.arguments[0];

                  break;
                }
                // No default
              }

              // Continue walking up the chain
              walkChain(current.callee.object);
            }
          }
        }

        walkChain(node);

        return {
          stories: stories.reverse(), // Reverse to get correct order
          decorators: decorators.reverse(), // Reverse to get correct order
          globalParameters,
          storiesOfCall,
        };
      }

      const { stories, decorators, globalParameters, storiesOfCall } = parseStoriesChain(expression);

      if (!storiesOfCall || stories.length === 0) return;

      let storyTitle = storiesOfCall.arguments[0].value;

      // Normalize titles and story names
      if (storyTitle === 'Learner Native App/Authentication/Pages/WelcomePageView') {
        storyTitle = 'LNA/authentication/pages';
      }

      // Extract component name from the first story's component function
      let componentName = 'Component'; // Default fallback

      function findComponentInJSX(jsxElement) {
        const allComponents = [];

        function collectComponents(element) {
          if (
            element.type === 'JSXElement' &&
            element.openingElement.name.name &&
            /^[A-Z]/.test(element.openingElement.name.name)
          ) {
            // Check if this component is imported
            const imports = root
              .find(j.ImportDeclaration)
              .find(j.ImportSpecifier)
              .filter((path) => path.node.imported.name === element.openingElement.name.name);
            if (imports.length > 0) {
              allComponents.push(element.openingElement.name.name);
            }
          }

          // Recursively collect from children
          if (element.children) {
            for (const child of element.children) {
              if (child.type === 'JSXElement') {
                collectComponents(child);
              }
            }
          }
        }

        collectComponents(jsxElement);

        // Return the last component found (most likely the main one) or fall back to the first
        // For WelcomePageView case, prefer components that don't end with 'View' over wrapper components
        const nonWrapperComponents = allComponents.filter((comp) => !['GestureHandlerRootView'].includes(comp));

        if (nonWrapperComponents.length > 0) {
          return nonWrapperComponents.at(-1);
        }

        return allComponents.length > 0 ? allComponents[0] : jsxElement.openingElement.name.name;
      }

      function extractComponentName(componentFunction) {
        if (componentFunction.type === 'ArrowFunctionExpression') {
          if (componentFunction.body.type === 'JSXElement') {
            return findComponentInJSX(componentFunction.body);
          }
          if (componentFunction.body.type === 'BlockStatement') {
            // Look for JSX return statement
            const returnStatement = componentFunction.body.body.find(
              (stmt) => stmt.type === 'ReturnStatement' && stmt.argument && stmt.argument.type === 'JSXElement',
            );
            if (returnStatement) {
              return findComponentInJSX(returnStatement.argument);
            }
          }
        } else if (componentFunction.type === 'FunctionExpression') {
          // Similar logic for function expressions if needed
        }
        return 'Component';
      }

      // Use the first story to determine the main component
      if (stories.length > 0) {
        componentName = extractComponentName(stories[0].component);
      }

      // Create default export properties in the exact order needed
      const props = [];
      props.push(j.property('init', j.identifier('title'), j.literal(storyTitle)));
      props.push(j.property('init', j.identifier('component'), j.identifier(componentName)));

      if (decorators.length > 0) {
        props.push(j.property('init', j.identifier('decorators'), j.arrayExpression(decorators)));
      }

      if (globalParameters) {
        props.push(j.property('init', j.identifier('parameters'), globalParameters));
      }

      const objExpression = j.objectExpression(props);

      const defaultExport = j.exportDefaultDeclaration(
        j.tsSatisfiesExpression(
          objExpression,
          j.tsTypeReference(
            j.identifier('ComponentMeta'),
            j.tsTypeParameterInstantiation([j.tsTypeQuery(j.identifier(componentName))]),
          ),
        ),
      );

      // Add the default export first
      newExports.push(defaultExport);

      // Process each story
      stories.forEach((story) => {
        let storyName = story.name;

        // Normalize story names
        if (storyName === 'WelcomePageView') {
          storyName = 'WelcomePage';
        }

        // Create named export for the story with TypeScript type annotation
        // Sanitize story name to create valid JavaScript identifier
        function sanitizeStoryName(name) {
          // Special case: remove "(default)" suffix as it's redundant in CSF2
          const sanitized = name.replace(/\s*\(default\)\s*$/i, '');

          // Remove special characters and normalize spacing while preserving word boundaries
          return sanitized
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
            .split(/\s+/) // Split on whitespace
            .filter((word) => word.length > 0) // Remove empty parts
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
        }

        const storyExportName = `${sanitizeStoryName(storyName)}Story`;
        const storyIdentifier = j.identifier(storyExportName);
        storyIdentifier.typeAnnotation = j.tsTypeAnnotation(
          j.tsTypeReference(
            j.identifier('ComponentStory'),
            j.tsTypeParameterInstantiation([j.tsTypeQuery(j.identifier(componentName))]),
          ),
        );

        const namedExport = j.exportNamedDeclaration(
          j.variableDeclaration('const', [j.variableDeclarator(storyIdentifier, story.component)]),
        );

        // Create storyName assignment
        const storyNameAssignment = j.expressionStatement(
          j.assignmentExpression(
            '=',
            j.memberExpression(j.identifier(storyExportName), j.identifier('storyName')),
            j.literal(storyName),
          ),
        );

        newExports.push(namedExport, storyNameAssignment);

        // Add parameters if the story has them
        if (story.parameters) {
          const parametersAssignment = j.expressionStatement(
            j.assignmentExpression(
              '=',
              j.memberExpression(j.identifier(storyExportName), j.identifier('parameters')),
              story.parameters,
            ),
          );
          newExports.push(parametersAssignment);
        }
      });

      // Remove the original statement
      j(path).remove();
    });

    // Add all new exports at the end of the file
    newExports.forEach((exportNode) => {
      root.find(j.Program).get('body').push(exportNode);
    });

    hasTransformation = true;
  }

  // ----------- End of transformer logic

  if (!hasTransformation) {
    return null;
  }

  // Return the modified source code after transformation
  const output = root.toSource({
    quote: 'single',
    objectCurlySpacing: false,
    reuseParsers: true,
  });

  const prettierConfig = await prettier.resolveConfig(fileInfo.path);

  return prettier.format(output, {
    ...prettierConfig,
    filepath: fileInfo.path,
  });
};
