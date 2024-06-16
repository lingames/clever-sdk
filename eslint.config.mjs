import js from '@eslint/js';
import globals from 'globals';
import * as TypeScriptParser from "@typescript-eslint/parser";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parser: TypeScriptParser
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'indent': ['error', 4],
            'no-console': 'off',
            'curly': ['error', 'multi-line'],
            "no-unused-vars": "warn",
            "quote-props": ["warn", "as-needed"],
            "no-undef": "warn"
        },
    },
    {
        ignores: ['dist/**/*'],
    },
];