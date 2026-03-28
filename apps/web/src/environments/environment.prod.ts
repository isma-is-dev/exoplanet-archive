declare global {
  interface Window {
    __EXODEX_API_URL__?: string;
  }
}

export const environment = {
  production: true,
  apiBaseUrl: typeof window !== 'undefined' && window.__EXODEX_API_URL__ 
    ? window.__EXODEX_API_URL__ 
    : '/api',
};
