export const TELESCOPE_WIKI_LINKS: Record<string, string> = {
  'Kepler Space Telescope': 'https://en.wikipedia.org/wiki/Kepler_space_telescope',
  'TESS Satellite': 'https://en.wikipedia.org/wiki/Transiting_Exoplanet_Survey_Satellite',
  'Hubble Space Telescope': 'https://en.wikipedia.org/wiki/Hubble_Space_Telescope',
  'James Webb Space Telescope': 'https://en.wikipedia.org/wiki/James_Webb_Space_Telescope',
  'Spitzer': 'https://en.wikipedia.org/wiki/Spitzer_Space_Telescope',
  'HARPS': 'https://en.wikipedia.org/wiki/High_Accuracy_Radial_velocity_Planet_Searcher',
  'MEarth Array': 'https://en.wikipedia.org/wiki/MEarth_Project',
  'SuperWASP': 'https://en.wikipedia.org/wiki/WASP',
  'HIRES': 'https://en.wikipedia.org/wiki/High_Resolution_Echelle_Spectrometer',
  'CoRoT Satellite': 'https://en.wikipedia.org/wiki/CoRoT',
  'Gemini Planet Imager': 'https://en.wikipedia.org/wiki/Gemini_Planet_Imager',
  'ELODIE': 'https://en.wikipedia.org/wiki/ELODIE_spectrograph',
  'HAT-9': 'https://en.wikipedia.org/wiki/HATNet_Project',
};

export function getTelescopeWikiLink(telescope: string | null): string | null {
  if (!telescope) return null;
  // If we have a direct mapping, use it. Otherwise fallback to a wikipedia search
  return TELESCOPE_WIKI_LINKS[telescope] || `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(telescope + ' telescope')}`;
}
