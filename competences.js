/**
 * FlexMoney — Référentiel des compétences par secteur
 * Fichier central utilisé par toutes les pages
 */

const FLEXMONEY_SECTEURS = [
  {
    id: 'bureau',
    label: '💼 Bureau & Admin',
    desc: 'Télétravail · Nouveau marché juillet 2026',
    featured: true, // Mise en avant comme cœur de cible FlexMoney
    couleur: '#6366f1',
    bg: '#f0f0ff',
    competences: [
      'Comptabilité générale',
      'Encodage de factures',
      'Déclaration TVA',
      'Clôture de bilan',
      'Payroll / Gestion salariale',
      'Audit & contrôle',
      'Reporting Excel',
      'Tableaux de bord',
      'Back-office administratif',
      'Secrétariat',
      'Gestion de dossiers clients',
      'Accueil & service client',
      'Traduction FR/NL/EN',
      'Gestion de projet',
      'Planification & agenda',
      'Facturation & recouvrement',
    ]
  },
  {
    id: 'digital',
    label: '💻 IT & Digital',
    desc: '100% télétravail · Nouveau marché juillet 2026',
    featured: true,
    couleur: '#8b5cf6',
    bg: '#f5f3ff',
    competences: [
      'Développement web (HTML/CSS/JS)',
      'Développement React / Vue',
      'Développement WordPress',
      'Support IT / Helpdesk',
      'Administration système',
      'Marketing digital',
      'Gestion réseaux sociaux',
      'Community management',
      'SEO / Référencement',
      'Google Ads / Meta Ads',
      'Email marketing',
      'E-commerce (Shopify/WooCommerce)',
      'Design graphique (Photoshop/Canva)',
      'Rédaction web / Copywriting',
      'Data & Analytics (Google Analytics)',
      'CRM (Hubspot / Salesforce)',
      'Automatisation (Zapier / Make)',
    ]
  },
  {
    id: 'horeca',
    label: '🍽️ Horeca & Hôtellerie',
    desc: 'Secteur historique du flexi-job',
    featured: false,
    couleur: '#f59e0b',
    bg: '#fffbeb',
    competences: [
      'Serveur / Serveuse',
      'Barman / Barmaid',
      'Barista / Café',
      'Chef de rang',
      'Maître d\'hôtel',
      'Cuisinier / Commis de cuisine',
      'Chef de partie',
      'Plongeur / Aide cuisine',
      'Réceptionniste hôtel',
      'Room service',
      'Gouvernante / Femme de chambre',
      'Traiteur & banquets',
      'Événementiel & séminaires',
      'Caisse & encaissement',
      'Livraison de repas',
    ]
  },
  {
    id: 'manuel',
    label: '🔧 Métiers manuels',
    desc: 'Week-end & soirées chez indépendants',
    featured: false,
    couleur: '#16a34a',
    bg: '#f0fdf4',
    competences: [
      'Manœuvre / Aide générale',
      'Aide maçonnerie',
      'Peinture intérieure / extérieure',
      'Plomberie de base',
      'Électricité de base',
      'Jardinage & tonte',
      'Paysagisme & aménagement',
      'Déménagement & portage',
      'Nettoyage professionnel',
      'Menuiserie & bricolage',
      'Carrelage & revêtements',
      'Montage de meubles',
      'Débarras & tri',
      'Aide à la rénovation',
      'Transport & livraison',
    ]
  },
  {
    id: 'commerce',
    label: '🛒 Commerce & Retail',
    desc: 'Vente, caisse et logistique',
    featured: false,
    couleur: '#0ea5e9',
    bg: '#f0f9ff',
    competences: [
      'Vendeur / Vendeuse en magasin',
      'Caissier / Caissière',
      'Gestionnaire de stock',
      'Merchandising & mise en rayon',
      'Conseil client',
      'Préparation de commandes',
      'Logistique & entrepôt',
      'Inventaire',
      'Livraison (voiture/vélo)',
      'Animateur(trice) commercial(e)',
    ]
  },
  {
    id: 'services',
    label: '🤝 Services à la personne',
    desc: 'Aide, soin et accompagnement',
    featured: false,
    couleur: '#ec4899',
    bg: '#fdf2f8',
    competences: [
      'Garde d\'enfants',
      'Baby-sitting',
      'Aide à domicile',
      'Accompagnement séniors',
      'Aide aux repas',
      'Transport de personnes',
      'Courses & commissions',
      'Cours particuliers',
      'Coaching sportif',
      'Aide aux devoirs',
    ]
  }
];

// Toutes les compétences à plat (pour la recherche)
const TOUTES_COMPETENCES = FLEXMONEY_SECTEURS.flatMap(s => s.competences);

// Trouver le secteur d'une compétence
function getSecteurDeCompetence(competence) {
  return FLEXMONEY_SECTEURS.find(s => s.competences.includes(competence));
}

// Générer les onglets secteurs HTML
function renderSecteurTabs(containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = FLEXMONEY_SECTEURS.map((s, i) => `
    <button
      class="secteur-tab ${i === 0 ? 'active' : ''}"
      data-id="${s.id}"
      style="${i === 0 ? `background:${s.couleur};color:#fff;border-color:${s.couleur}` : ''}"
      onclick="selectSecteurTab('${s.id}', this, '${s.couleur}')"
    >
      ${s.label}
      ${s.featured ? '<span class="new-badge">NOUVEAU</span>' : ''}
    </button>
  `).join('');
}

// Sélectionner un onglet
function selectSecteurTab(secteurId, btn, couleur) {
  document.querySelectorAll('.secteur-tab').forEach(t => {
    t.classList.remove('active');
    t.style.background = '#fff';
    t.style.color = '#64748b';
    t.style.borderColor = '#e2e8f0';
  });
  btn.classList.add('active');
  btn.style.background = couleur;
  btn.style.color = '#fff';
  btn.style.borderColor = couleur;

  // Afficher les compétences du secteur
  if (typeof renderCompetencesPourSecteur === 'function') {
    renderCompetencesPourSecteur(secteurId);
  }
  if (typeof filterBySecteur === 'function') {
    filterBySecteur(secteurId);
  }
}

// Générer les chips de compétences pour un secteur
function renderCompetenceChips(secteurId, containerId, selectedComps, onToggle) {
  const secteur = FLEXMONEY_SECTEURS.find(s => s.id === secteurId);
  if (!secteur) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = secteur.competences.map(c => `
    <div
      class="comp-chip ${selectedComps.includes(c) ? 'selected' : ''}"
      style="${selectedComps.includes(c) ? `background:${secteur.couleur};color:#fff;border-color:${secteur.couleur}` : ''}"
      onclick="toggleComp('${c.replace(/'/g, "\\'")}', this, '${secteur.couleur}')"
    >${c}</div>
  `).join('');
}
