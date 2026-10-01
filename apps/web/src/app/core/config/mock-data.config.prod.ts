/**
 * Production build of the mock-data gate. See `mock-data.config.ts`.
 *
 * Hard-coded to `false`: a production build can never serve fabricated
 * planets, and the bundler removes the mock dataset from the output.
 */
export const MOCK_DATA_ENABLED = false;
