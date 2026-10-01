/**
 * Compile-time switch for the fabricated development dataset.
 *
 * Exodex is only credible if every planet it shows came from the NASA
 * Exoplanet Archive, so the production build swaps this file for
 * `mock-data.config.prod.ts` (see the `fileReplacements` entry in
 * `apps/web/project.json`). That replacement hard-codes the flag to `false`,
 * which lets the bundler constant-fold the flag and drop every guarded
 * `import('./exoplanet-mock.service')` — the mock dataset is not shipped.
 *
 * On top of the build flag, the service also requires an explicit runtime
 * opt-in (localStorage) so a developer is never silently handed fake planets.
 */
export const MOCK_DATA_ENABLED = true;
