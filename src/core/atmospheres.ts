export interface Atmosphere {
  id: string;
  nameKey: string;
  colors: string[]; // 4 colors for the 4 moving blobs in KomorebiBackground
}

export const ATMOSPHERES: Atmosphere[] = [
  {
    id: 'default',
    nameKey: 'atmosphere_default',
    colors: ['#A8C97F', '#E95464', '#33A6B8', '#FFB11B'] // Wood, Fire, Water, Earth
  },
  {
    id: 'morning',
    nameKey: 'atmosphere_morning',
    colors: ['#FFB7B2', '#FFB11B', '#A8C97F', '#F8FBF8'] // Pink, Yellow, Green, White
  },
  {
    id: 'sea',
    nameKey: 'atmosphere_sea',
    colors: ['#33A6B8', '#B39DDB', '#2E2E2E', '#F8FBF8'] // Teal, Purple, Ink, White
  },
  {
    id: 'forest',
    nameKey: 'atmosphere_forest',
    colors: ['#A8C97F', '#FFB11B', '#33A6B8', '#F8FBF8'] // Green, Yellow, Teal, White
  }
];

export const getStoredAtmosphere = (): Atmosphere => {
  const id = localStorage.getItem('eunie_atmosphere') || 'default';
  return ATMOSPHERES.find(a => a.id === id) || ATMOSPHERES[0];
};

export const setStoredAtmosphere = (id: string) => {
  localStorage.setItem('eunie_atmosphere', id);
  window.dispatchEvent(new CustomEvent('atmosphere-changed', { detail: id }));
};
