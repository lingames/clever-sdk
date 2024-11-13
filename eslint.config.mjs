import js from "@eslint/js";
import globals from "globals";


export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
                myCustomGlobal: "readonly"
            }
        }
    },
    {
        rules: {
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'indent': ['error', 4],
            'no-unused-vars': 'warn',
            'no-console': 'off',
            'curly': ['error', 'multi-line'],
        },
        ignores: ["**/temp.js", "config/*"]
    }
];
