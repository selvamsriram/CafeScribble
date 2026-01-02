import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow exporting helper functions alongside components (common pattern)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Allow setState in effects for initialization patterns (e.g., auth check on mount)
      // This is a common and valid pattern when syncing with external systems like localStorage
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
