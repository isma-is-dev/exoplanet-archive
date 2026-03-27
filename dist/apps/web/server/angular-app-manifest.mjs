
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 0,
    "route": "/planeta/*"
  },
  {
    "renderMode": 2,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 12214, hash: '77162e61366839f02880465b61e8e417350851faba7069f7e1c851fb5e2b1bb1', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 12340, hash: '0f866fc110a7e590a5fb6d311c64ba2eefda8171f47a1cfb8a7941a8f1fcb83f', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 40406, hash: 'be86280d196a48950b84604aa9fd0099234f0c87e83a74912697e270bfe06a57', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-OF3DUMLZ.css': {size: 1557, hash: 'obyQ7oKghdk', text: () => import('./assets-chunks/styles-OF3DUMLZ_css.mjs').then(m => m.default)}
  },
};
