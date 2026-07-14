// ═══════════════════════════════════════════════════════════
// shared.js — Config et helpers communs FlexMoney
// Chargé par toutes les pages APRÈS les scripts CDN
// (supabase.min.js et email.min.js si la page les utilise)
// ═══════════════════════════════════════════════════════════

// ── Supabase ─────────────────────────────────────────────
const SUPABASE_URL = 'https://nresngetymtpxusrhlfj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_j8Yk8yjUMQv0AGlqHqn19Q_NJ34mcvT';

// Client Supabase (uniquement si le CDN supabase est chargé sur la page)
const sb = window.supabase ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ── EmailJS ──────────────────────────────────────────────
const EJS_PUBLIC_KEY = 'YAyl_sI2uC4Q2YCCF';
const EJS_SERVICE_ID = 'service_2749nt8';
if (window.emailjs) emailjs.init(EJS_PUBLIC_KEY);

// ── Helpers communs ──────────────────────────────────────

// Déconnexion (redirection vers auth.html par défaut)
async function signOut(redirect = 'auth.html') {
  await sb.auth.signOut();
  window.location.href = redirect;
}

// Formatage montant : 1234.5 → "1 234,50"
function fmt(n) {
  return (n || 0).toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Barre d'actions rapides employeur (sticky, sur toutes les pages employeur) ──
const FLX_EMPLOYER_PAGES = [
  'dashboard-employeur.html',
  'poster-mission.html',
  'tableau-travailleurs.html',
  'mes-travailleurs.html',
  'validation-mission.html',
  'tableau-missions.html'
];

const FLX_QUICKBAR_LINKS = [
  { href: 'dashboard-employeur.html',  icon: '🏠', label: 'Accueil' },
  { href: 'poster-mission.html',       icon: '📢', label: 'Poster une mission' },
  { href: 'tableau-travailleurs.html', icon: '👥', label: 'Parcourir les profils' },
  { href: 'mes-travailleurs.html',     icon: '🤝', label: 'Mes travailleurs' }
];

function mountEmployerQuickbar() {
  if (document.querySelector('.flx-quickbar')) return; // déjà montée

  const style = document.createElement('style');
  style.textContent = `
    .flx-quickbar{position:sticky;top:0;z-index:1000;display:flex;gap:8px;justify-content:center;
      flex-wrap:wrap;background:#fff;border-bottom:1px solid #e2e8f0;padding:10px 16px;
      box-shadow:0 2px 8px rgba(15,23,42,0.05);}
    .flx-qbtn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;
      font-size:13px;font-weight:600;text-decoration:none;color:#334155;background:#f8fafc;
      border:1px solid #e2e8f0;white-space:nowrap;transition:all .15s;cursor:pointer;}
    .flx-qbtn:hover{background:#eef2ff;color:#4f46e5;border-color:#c7d2fe;}
    .flx-qbtn.active{background:#6366f1;color:#fff;border-color:#6366f1;cursor:default;box-shadow:0 2px 6px rgba(99,102,241,0.35);}
    .flx-qbtn.active:hover{background:#6366f1;color:#fff;border-color:#6366f1;}
    @media(max-width:640px){.flx-qbtn{padding:8px 10px;font-size:12px;}}
  `;
  document.head.appendChild(style);

  const current = (location.pathname.split('/').pop() || '').toLowerCase();
  const bar = document.createElement('div');
  bar.className = 'flx-quickbar';
  bar.innerHTML = FLX_QUICKBAR_LINKS.map(l => {
    const target = l.href.split('#')[0].toLowerCase();
    const isActive = target === current; // met en évidence l'onglet de la page courante
    return `<a class="flx-qbtn${isActive ? ' active' : ''}" href="${l.href}">${l.icon} ${l.label}</a>`;
  }).join('');
  document.body.insertBefore(bar, document.body.firstChild);
}

// Auto-montage : uniquement sur une page employeur ET pour un utilisateur employeur
(async () => {
  if (!sb) return;
  const page = (location.pathname.split('/').pop() || '').toLowerCase();
  if (!FLX_EMPLOYER_PAGES.includes(page)) return;
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user?.user_metadata?.role !== 'employeur') return;
  } catch(e) { return; }
  if (document.body) mountEmployerQuickbar();
  else document.addEventListener('DOMContentLoaded', mountEmployerQuickbar);
})();
