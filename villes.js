/**
 * FlexMoney — Référentiel des villes belges (pour filtre géographique)
 * Fichier central utilisé par toutes les pages
 */

const VILLES_BELGIQUE = [
  { nom: 'Bruxelles', lat: 50.8503, lng: 4.3517 },
  { nom: 'Anvers', lat: 51.2194, lng: 4.4025 },
  { nom: 'Gand', lat: 51.0543, lng: 3.7174 },
  { nom: 'Charleroi', lat: 50.4108, lng: 4.4446 },
  { nom: 'Liège', lat: 50.6326, lng: 5.5797 },
  { nom: 'Bruges', lat: 51.2093, lng: 3.2247 },
  { nom: 'Namur', lat: 50.4674, lng: 4.8718 },
  { nom: 'Louvain', lat: 50.8798, lng: 4.7005 },
  { nom: 'Mons', lat: 50.4542, lng: 3.9523 },
  { nom: 'Alost', lat: 50.9378, lng: 4.0397 },
  { nom: 'Malines', lat: 51.0259, lng: 4.4776 },
  { nom: 'La Louvière', lat: 50.4796, lng: 4.1889 },
  { nom: 'Courtrai', lat: 50.8280, lng: 3.2649 },
  { nom: 'Hasselt', lat: 50.9307, lng: 5.3325 },
  { nom: 'Saint-Nicolas', lat: 51.1657, lng: 4.1431 },
  { nom: 'Tournai', lat: 50.6053, lng: 3.3892 },
  { nom: 'Genk', lat: 50.9654, lng: 5.5008 },
  { nom: 'Seraing', lat: 50.5892, lng: 5.4890 },
  { nom: 'Roulers', lat: 50.9500, lng: 3.1274 },
  { nom: 'Verviers', lat: 50.5895, lng: 5.8623 },
  { nom: 'Mouscron', lat: 50.7452, lng: 3.2126 },
  { nom: 'Ostende', lat: 51.2154, lng: 2.9286 },
  { nom: 'Waterloo', lat: 50.7167, lng: 4.4000 },
  { nom: 'Wavre', lat: 50.7167, lng: 4.6000 },
  { nom: "Braine-l'Alleud", lat: 50.6833, lng: 4.3667 },
  { nom: 'Nivelles', lat: 50.5983, lng: 4.3261 },
  { nom: 'Dinant', lat: 50.2603, lng: 4.9106 },
  { nom: 'Huy', lat: 50.5186, lng: 5.2411 },
  { nom: 'Arlon', lat: 49.6833, lng: 5.8167 },
  { nom: 'Marche-en-Famenne', lat: 50.2278, lng: 5.3439 },
  { nom: 'Ath', lat: 50.6297, lng: 3.7772 },
  { nom: 'Binche', lat: 50.4114, lng: 4.1650 },
  { nom: 'Soignies', lat: 50.5775, lng: 4.0708 },
  { nom: 'Braine-le-Comte', lat: 50.6081, lng: 4.1428 },
  { nom: 'Enghien', lat: 50.6931, lng: 4.0353 },
  { nom: 'Halle', lat: 50.7333, lng: 4.2333 },
  { nom: 'Vilvoorde', lat: 50.9275, lng: 4.4258 },
  { nom: 'Zaventem', lat: 50.8836, lng: 4.4714 },
  { nom: 'Grimbergen', lat: 50.9333, lng: 4.3833 },
  { nom: 'Termonde', lat: 51.0281, lng: 4.1006 },
  { nom: 'Eeklo', lat: 51.1858, lng: 3.5619 },
  { nom: 'Audenarde', lat: 50.8453, lng: 3.6089 },
  { nom: 'Ypres', lat: 50.8500, lng: 2.8858 },
  { nom: 'Furnes', lat: 51.0736, lng: 2.6675 },
  { nom: 'Knokke-Heist', lat: 51.3500, lng: 3.2833 },
  { nom: 'Turnhout', lat: 51.3225, lng: 4.9439 },
  { nom: 'Mol', lat: 51.1911, lng: 5.1147 },
  { nom: 'Geel', lat: 51.1642, lng: 4.9836 },
  { nom: 'Lierre', lat: 51.1306, lng: 4.5706 },
  { nom: 'Herentals', lat: 51.1789, lng: 4.8339 },
  { nom: 'Tongres', lat: 50.7811, lng: 5.4653 },
  { nom: 'Saint-Trond', lat: 50.8156, lng: 5.1878 },
  { nom: 'Eupen', lat: 50.6278, lng: 6.0339 },
  { nom: 'Chimay', lat: 50.0489, lng: 4.3175 },
  { nom: 'Philippeville', lat: 50.1975, lng: 4.5442 },
  { nom: 'Ciney', lat: 50.2939, lng: 5.0997 },
];

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
