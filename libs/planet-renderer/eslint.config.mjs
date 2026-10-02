import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/esbuild.config.{js,ts,mjs,mts}',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      // Same rule and options as the workspace config, with one deliberate
      // exception: this is the only buildable library in the workspace, and its
      // single cross-project dependency is `@exodex/shared-types`, imported for
      // types only (PlanetType, PlanetRenderParams, StarRenderOutput, ...).
      // Type-only imports are erased at compile time, so the emitted bundle in
      // dist/libs/planet-renderer carries no reference to a package that would
      // have to be published — which is exactly what the buildable-lib check
      // protects against. shared-types has no build target because it ships no
      // runtime code. Re-enable this if shared-types ever gains real output.
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
];
