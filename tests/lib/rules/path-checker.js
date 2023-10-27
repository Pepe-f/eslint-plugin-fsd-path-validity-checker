/**
 * @fileoverview Feature sliced design relative path checker
 * @author Nikita Kopylov
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 6, sourceType: 'module' }
});
ruleTester.run("path-checker", rule, {
  valid: [
    {
      filename: '/home/nikko/code/good-react-project/src/entities/Article/model/slices/addCommentFormSlice.ts',
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
      errors: [],
    },
  ],

  invalid: [
    {
      filename: '/home/nikko/code/good-react-project/src/entities/Article/model/slices/addCommentFormSlice.ts',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "Within one slice, all paths must be relative" }],
      output: "import { addCommentFormActions, addCommentFormReducer } from './addCommentFormSlice'",
    },
    {
      filename: '/home/nikko/code/good-react-project/src/entities/Article/model/slices/addCommentFormSlice.ts',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "Within one slice, all paths must be relative" }],
      options: [
        {
          alias: '@'
        }
      ],
      output: "import { addCommentFormActions, addCommentFormReducer } from './addCommentFormSlice'",
    },
  ],
});
