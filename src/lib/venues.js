// Real FIFA World Cup 2026 host cities — 16 venues across 3 countries.
// Coordinates below are stylized layout positions for the network diagram
// (grouped by geographic region), not literal lat/long projections.

export const VENUES = [
  { id: 'YVR', name: 'Vancouver', country: 'ca', x: 60, y: 70 },
  { id: 'SEA', name: 'Seattle', country: 'us', x: 90, y: 110 },
  { id: 'SFO', name: 'SF Bay Area', country: 'us', x: 80, y: 190 },
  { id: 'LAX', name: 'Los Angeles', country: 'us', x: 120, y: 250 },
  { id: 'GDL', name: 'Guadalajara', country: 'mx', x: 220, y: 340 },
  { id: 'MEX', name: 'Mexico City', country: 'mx', x: 270, y: 380 },
  { id: 'MTY', name: 'Monterrey', country: 'mx', x: 250, y: 300 },
  { id: 'DAL', name: 'Dallas', country: 'us', x: 320, y: 250 },
  { id: 'HOU', name: 'Houston', country: 'us', x: 330, y: 300 },
  { id: 'KC', name: 'Kansas City', country: 'us', x: 360, y: 190 },
  { id: 'ATL', name: 'Atlanta', country: 'us', x: 460, y: 270 },
  { id: 'MIA', name: 'Miami', country: 'us', x: 520, y: 360 },
  { id: 'YYZ', name: 'Toronto', country: 'ca', x: 500, y: 90 },
  { id: 'BOS', name: 'Boston', country: 'us', x: 580, y: 100 },
  { id: 'NYNJ', name: 'New York/New Jersey', country: 'us', x: 560, y: 150 },
  { id: 'PHL', name: 'Philadelphia', country: 'us', x: 550, y: 180 },
];

export const COUNTRY_NAMES = { us: 'USA', mx: 'Mexico', ca: 'Canada' };

// A handful of illustrative "live" inter-city links for the network diagram —
// representative fan-travel corridors between nearby host cities, not a
// literal current schedule.
export const LINKS = [
  ['YVR', 'SEA'], ['SEA', 'SFO'], ['SFO', 'LAX'], ['LAX', 'GDL'],
  ['GDL', 'MEX'], ['MEX', 'MTY'], ['MTY', 'DAL'], ['DAL', 'HOU'],
  ['DAL', 'KC'], ['HOU', 'ATL'], ['KC', 'ATL'], ['ATL', 'MIA'],
  ['ATL', 'NYNJ'], ['NYNJ', 'BOS'], ['NYNJ', 'PHL'], ['NYNJ', 'YYZ'],
  ['YYZ', 'BOS'],
];

export function findVenue(id) {
  return VENUES.find((v) => v.id === id);
}
