/**
 * @fileoverview Feature sliced design relative path checker
 * @author Nikita Kopylov
 */
"use strict";

const path = require('path');
const { isPathRelative } = require("../helpers");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null,
    docs: {
      description: "Feature sliced design relative path checker",
      recommended: false,
      url: null,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          }
        }
      }
    ],
  },

  create(context) {
    const alias = context.options[0]?.alias || '';
    return {
      ImportDeclaration(node) {
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, '') : value;

        const fromFilename = context.getFilename();

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report({
            node,
            message: 'Within one slice, all paths must be relative',
            fix: (fixer) => {
              const normalizedPath= getNormalizedCurrentFilePath(fromFilename)
                .split('/')
                .slice(0, -1)
                .join('/');

              let relativePath = path.relative(normalizedPath, `/${importTo}`)
                .split('\\')
                .join('/');

              if (!relativePath.startsWith('.')) {
                relativePath = './' + relativePath;
              }

              return fixer.replaceText(node.source, `'${relativePath}'`);
            }
          });
        }
      }
    };
  },
};

const layers = {
  'entities': 'entities',
  'features': 'features',
  'pages': 'pages',
  'shared': 'shared',
  'widgets': 'widgets',
};

function getNormalizedCurrentFilePath(currentFilePath) {
  const normalizedPath = path.toNamespacedPath(currentFilePath);
  const projectFrom = normalizedPath.split('src')[1];
  return projectFrom.split('\\').join('/');
}

function shouldBeRelative(from, to) {
  if (isPathRelative(to)) {
    return false;
  }

  const toArray = to.split('/');
  const toLayer = toArray[0];
  const toSlice = toArray[1];

  if (!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  const projectFrom = getNormalizedCurrentFilePath(from);
  const fromArray = projectFrom.split('/');
  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if (!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}

// console.log(shouldBeRelative('/home/nikko/code/good-react-project/src/entities/Article/ui/ArticleDetails/ArticleDetails.tsx', 'entities/Article/ui/ArticleCodeBlockComponent/ArticleCodeBlockComponent'));
// console.log(shouldBeRelative('/home/nikko/code/good-react-project/src/entities/Article/ui/ArticleDetails/ArticleDetails.tsx', 'entities/User/ui/ArticleCodeBlockComponent/ArticleCodeBlockComponent'));
// console.log(shouldBeRelative('\\home\\nikko\\code\\good-react-project\\src\\entities\\Article\\ui\\ArticleDetails\\ArticleDetails.tsx', 'entities/Article/ui/ArticleCodeBlockComponent/ArticleCodeBlockComponent'));
