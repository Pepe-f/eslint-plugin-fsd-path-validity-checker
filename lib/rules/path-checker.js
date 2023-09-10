/**
 * @fileoverview Feature sliced design relative path checker
 * @author Nikita Kopylov
 */
"use strict";

const path = require('path');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "Feature sliced design relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importTo = node.source.value;

        const fromFilename = context.getFilename();

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report(node, 'Within one slice, all paths must be relative');
        }
      }
    };
  },
};

function isPathRelative(path) {
  return path === '.' || path.startsWith('./') || path.startsWith('../');
}

const layers = {
  'entities': 'entities',
  'features': 'features',
  'pages': 'pages',
  'shared': 'shared',
  'widgets': 'widgets',
};

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

  const normalizedPath = path.toNamespacedPath(from);
  const projectFrom = normalizedPath.split('src')[1];
  let fromArray = projectFrom.split('/');
  if (fromArray.length < 2) {
    fromArray = projectFrom.split('\\');
  }
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
