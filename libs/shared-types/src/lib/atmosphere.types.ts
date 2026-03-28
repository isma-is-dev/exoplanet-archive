export interface AtmosphereElement {
  symbol: string;       // e.g. "H₂O", "CO₂", "Na"
  name: string;         // e.g. "Water", "Carbon Dioxide", "Sodium"
  wavelengthNm: number; // absorption line center wavelength in nm
  bandWidthNm: number;  // width of absorption band in nm
  color: string;        // display color for the absorption line
  confidence: 'confirmed' | 'tentative';
}

export interface AtmosphereData {
  planetId: string;
  telescope: string;    // telescope that made the detection
  year: number;         // year of detection/publication
  elements: AtmosphereElement[];
  notes: string;        // brief scientific note
}

// Real atmospheric detections based on published scientific papers
export const ATMOSPHERE_DATABASE: Record<string, AtmosphereData> = {
  'hd-209458-b': {
    planetId: 'hd-209458-b',
    telescope: 'Hubble Space Telescope',
    year: 2001,
    notes: 'First exoplanet with detected atmosphere (sodium). Later studies revealed water vapor, carbon monoxide, and hydrogen escape.',
    elements: [
      { symbol: 'Na', name: 'Sodium', wavelengthNm: 589, bandWidthNm: 8, color: '#f59e0b', confidence: 'confirmed' },
      { symbol: 'H₂O', name: 'Water', wavelengthNm: 1400, bandWidthNm: 200, color: '#3b82f6', confidence: 'confirmed' },
      { symbol: 'CO', name: 'Carbon Monoxide', wavelengthNm: 2300, bandWidthNm: 150, color: '#ef4444', confidence: 'confirmed' },
      { symbol: 'H₂', name: 'Hydrogen', wavelengthNm: 121, bandWidthNm: 10, color: '#a855f7', confidence: 'confirmed' },
    ],
  },
  'hd-189733b': {
    planetId: 'hd-189733b',
    telescope: 'Hubble / Spitzer',
    year: 2007,
    notes: 'Famous blue planet. First detailed atmospheric spectrum of an exoplanet. Contains water, methane, and sodium. Rains glass sideways.',
    elements: [
      { symbol: 'Na', name: 'Sodium', wavelengthNm: 589, bandWidthNm: 8, color: '#f59e0b', confidence: 'confirmed' },
      { symbol: 'H₂O', name: 'Water', wavelengthNm: 1400, bandWidthNm: 200, color: '#3b82f6', confidence: 'confirmed' },
      { symbol: 'CH₄', name: 'Methane', wavelengthNm: 3300, bandWidthNm: 300, color: '#22c55e', confidence: 'confirmed' },
      { symbol: 'CO₂', name: 'Carbon Dioxide', wavelengthNm: 4300, bandWidthNm: 200, color: '#ec4899', confidence: 'confirmed' },
    ],
  },
  'k2-18b': {
    planetId: 'k2-18b',
    telescope: 'JWST (James Webb)',
    year: 2023,
    notes: 'JWST detected water, methane, and CO₂. Tentative detection of dimethyl sulfide (DMS), a potential biosignature only produced by life on Earth.',
    elements: [
      { symbol: 'H₂O', name: 'Water', wavelengthNm: 1400, bandWidthNm: 200, color: '#3b82f6', confidence: 'confirmed' },
      { symbol: 'CH₄', name: 'Methane', wavelengthNm: 3300, bandWidthNm: 300, color: '#22c55e', confidence: 'confirmed' },
      { symbol: 'CO₂', name: 'Carbon Dioxide', wavelengthNm: 4300, bandWidthNm: 200, color: '#ec4899', confidence: 'confirmed' },
      { symbol: 'DMS', name: 'Dimethyl Sulfide', wavelengthNm: 3400, bandWidthNm: 100, color: '#f97316', confidence: 'tentative' },
    ],
  },
  'wasp-12b': {
    planetId: 'wasp-12b',
    telescope: 'Hubble Space Telescope',
    year: 2010,
    notes: 'Ultra-hot Jupiter being consumed by its star. Detected titanium oxide and vanadium oxide in its scorching atmosphere (>2500K).',
    elements: [
      { symbol: 'TiO', name: 'Titanium Oxide', wavelengthNm: 670, bandWidthNm: 30, color: '#ef4444', confidence: 'confirmed' },
      { symbol: 'VO', name: 'Vanadium Oxide', wavelengthNm: 740, bandWidthNm: 25, color: '#a855f7', confidence: 'confirmed' },
      { symbol: 'Na', name: 'Sodium', wavelengthNm: 589, bandWidthNm: 8, color: '#f59e0b', confidence: 'confirmed' },
    ],
  },
  'gj-1214-b': {
    planetId: 'gj-1214-b',
    telescope: 'JWST (James Webb)',
    year: 2023,
    notes: 'Water world enshrouded in thick clouds or hazes. JWST observations revealed water vapor above a high-altitude cloud deck.',
    elements: [
      { symbol: 'H₂O', name: 'Water', wavelengthNm: 1400, bandWidthNm: 200, color: '#3b82f6', confidence: 'confirmed' },
    ],
  },
};
