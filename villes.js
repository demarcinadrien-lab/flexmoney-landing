/**
 * FlexMoney — Référentiel des villes belges (pour filtre géographique)
 * Fichier central utilisé par toutes les pages
 */

// region : 'wallonie' | 'flandre' | 'bruxelles'
const VILLES_BELGIQUE = [
  { nom: 'Bruxelles', lat: 50.8503, lng: 4.3517, region: 'bruxelles' },
  { nom: 'Anvers', lat: 51.2194, lng: 4.4025, region: 'flandre' },
  { nom: 'Gand', lat: 51.0543, lng: 3.7174, region: 'flandre' },
  { nom: 'Charleroi', lat: 50.4108, lng: 4.4446, region: 'wallonie' },
  { nom: 'Liège', lat: 50.6326, lng: 5.5797, region: 'wallonie' },
  { nom: 'Bruges', lat: 51.2093, lng: 3.2247, region: 'flandre' },
  { nom: 'Namur', lat: 50.4674, lng: 4.8718, region: 'wallonie' },
  { nom: 'Louvain', lat: 50.8798, lng: 4.7005, region: 'flandre' },
  { nom: 'Mons', lat: 50.4542, lng: 3.9523, region: 'wallonie' },
  { nom: 'Alost', lat: 50.9378, lng: 4.0397, region: 'flandre' },
  { nom: 'Malines', lat: 51.0259, lng: 4.4776, region: 'flandre' },
  { nom: 'La Louvière', lat: 50.4796, lng: 4.1889, region: 'wallonie' },
  { nom: 'Courtrai', lat: 50.8280, lng: 3.2649, region: 'flandre' },
  { nom: 'Hasselt', lat: 50.9307, lng: 5.3325, region: 'flandre' },
  { nom: 'Saint-Nicolas', lat: 51.1657, lng: 4.1431, region: 'flandre' },
  { nom: 'Tournai', lat: 50.6053, lng: 3.3892, region: 'wallonie' },
  { nom: 'Genk', lat: 50.9654, lng: 5.5008, region: 'flandre' },
  { nom: 'Seraing', lat: 50.5892, lng: 5.4890, region: 'wallonie' },
  { nom: 'Roulers', lat: 50.9500, lng: 3.1274, region: 'flandre' },
  { nom: 'Verviers', lat: 50.5895, lng: 5.8623, region: 'wallonie' },
  { nom: 'Mouscron', lat: 50.7452, lng: 3.2126, region: 'wallonie' },
  { nom: 'Ostende', lat: 51.2154, lng: 2.9286, region: 'flandre' },
  { nom: 'Waterloo', lat: 50.7167, lng: 4.4000, region: 'wallonie' },
  { nom: 'Wavre', lat: 50.7167, lng: 4.6000, region: 'wallonie' },
  { nom: "Braine-l'Alleud", lat: 50.6833, lng: 4.3667, region: 'wallonie' },
  { nom: 'Nivelles', lat: 50.5983, lng: 4.3261, region: 'wallonie' },
  { nom: 'Dinant', lat: 50.2603, lng: 4.9106, region: 'wallonie' },
  { nom: 'Huy', lat: 50.5186, lng: 5.2411, region: 'wallonie' },
  { nom: 'Arlon', lat: 49.6833, lng: 5.8167, region: 'wallonie' },
  { nom: 'Marche-en-Famenne', lat: 50.2278, lng: 5.3439, region: 'wallonie' },
  { nom: 'Ath', lat: 50.6297, lng: 3.7772, region: 'wallonie' },
  { nom: 'Binche', lat: 50.4114, lng: 4.1650, region: 'wallonie' },
  { nom: 'Soignies', lat: 50.5775, lng: 4.0708, region: 'wallonie' },
  { nom: 'Braine-le-Comte', lat: 50.6081, lng: 4.1428, region: 'wallonie' },
  { nom: 'Enghien', lat: 50.6931, lng: 4.0353, region: 'wallonie' },
  { nom: 'Halle', lat: 50.7333, lng: 4.2333, region: 'flandre' },
  { nom: 'Vilvoorde', lat: 50.9275, lng: 4.4258, region: 'flandre' },
  { nom: 'Zaventem', lat: 50.8836, lng: 4.4714, region: 'flandre' },
  { nom: 'Grimbergen', lat: 50.9333, lng: 4.3833, region: 'flandre' },
  { nom: 'Termonde', lat: 51.0281, lng: 4.1006, region: 'flandre' },
  { nom: 'Eeklo', lat: 51.1858, lng: 3.5619, region: 'flandre' },
  { nom: 'Audenarde', lat: 50.8453, lng: 3.6089, region: 'flandre' },
  { nom: 'Ypres', lat: 50.8500, lng: 2.8858, region: 'flandre' },
  { nom: 'Furnes', lat: 51.0736, lng: 2.6675, region: 'flandre' },
  { nom: 'Knokke-Heist', lat: 51.3500, lng: 3.2833, region: 'flandre' },
  { nom: 'Turnhout', lat: 51.3225, lng: 4.9439, region: 'flandre' },
  { nom: 'Mol', lat: 51.1911, lng: 5.1147, region: 'flandre' },
  { nom: 'Geel', lat: 51.1642, lng: 4.9836, region: 'flandre' },
  { nom: 'Lierre', lat: 51.1306, lng: 4.5706, region: 'flandre' },
  { nom: 'Herentals', lat: 51.1789, lng: 4.8339, region: 'flandre' },
  { nom: 'Tongres', lat: 50.7811, lng: 5.4653, region: 'flandre' },
  { nom: 'Saint-Trond', lat: 50.8156, lng: 5.1878, region: 'flandre' },
  { nom: 'Eupen', lat: 50.6278, lng: 6.0339, region: 'wallonie' },
  { nom: 'Chimay', lat: 50.0489, lng: 4.3175, region: 'wallonie' },
  { nom: 'Philippeville', lat: 50.1975, lng: 4.5442, region: 'wallonie' },
  { nom: 'Ciney', lat: 50.2939, lng: 5.0997, region: 'wallonie' },
];

// Villes wallonnes uniquement (cœur de cible FlexMoney)
const VILLES_WALLONIE = VILLES_BELGIQUE.filter(v => v.region === 'wallonie');
const TOUTES_VILLES_WALLONIE = VILLES_WALLONIE
  .map(v => v.nom)
  .sort((a, b) => a.localeCompare(b, 'fr-BE'));

// Toutes les villes triées alphabétiquement (pour les listes déroulantes)
const TOUTES_VILLES = VILLES_BELGIQUE.map(v => v.nom).sort((a, b) => a.localeCompare(b, 'fr-BE'));

// Distance à vol d'oiseau entre deux points (formule de Haversine), en km
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Distance (km) entre deux villes désignées par leur nom.
// Renvoie Infinity si l'une des villes est inconnue du référentiel.
function distanceVilles(nomA, nomB) {
  const a = VILLES_BELGIQUE.find(v => v.nom === nomA);
  const b = VILLES_BELGIQUE.find(v => v.nom === nomB);
  if (!a || !b) return Infinity;
  return distanceKm(a.lat, a.lng, b.lat, b.lng);
}

// Retourne les noms des villes situées dans un rayon donné (km) autour d'une ville de référence,
// triées de la plus proche à la plus éloignée. Inclut la ville elle-même.
function getVillesProches(nomVille, rayonKm = 25) {
  const ref = VILLES_BELGIQUE.find(v => v.nom === nomVille);
  if (!ref) return [nomVille];
  return VILLES_BELGIQUE
    .map(v => ({ nom: v.nom, dist: distanceKm(ref.lat, ref.lng, v.lat, v.lng) }))
    .filter(v => v.dist <= rayonKm)
    .sort((a, b) => a.dist - b.dist)
    .map(v => v.nom);
}
