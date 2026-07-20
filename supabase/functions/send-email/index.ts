// ═══════════════════════════════════════════════════════════════════
// send-email — Edge Function FlexMoney
// Fournisseur : Brevo (ex-Sendinblue) — hébergement UE, conforme RGPD
//
// Remplace EmailJS : la clé API reste côté serveur, les templates sont
// versionnés dans ce fichier (plus de dépendance à un éditeur externe).
//
// Secrets requis (Supabase → Edge Functions → Secrets) :
//   BREVO_API_KEY   clé API v3 Brevo
//   MAIL_FROM       ex. no-reply@flexmoney.be  (domaine authentifié SPF/DKIM)
//   MAIL_FROM_NAME  ex. FlexMoney              (optionnel)
//   MAIL_REPLY_TO   ex. contact@flexmoney.be   (optionnel)
//   SITE_URL        ex. https://www.flexmoney.be   (liens dans les e-mails)
//   ALLOWED_ORIGINS ex. https://www.flexmoney.be,https://flexmoney.vercel.app
//
// Appel : POST { template: 'worker', to: 'x@y.be', params: {...} }
// ═══════════════════════════════════════════════════════════════════

const BREVO_API_KEY   = Deno.env.get('BREVO_API_KEY') ?? '';
const MAIL_FROM       = Deno.env.get('MAIL_FROM') ?? 'no-reply@flexmoney.be';
const MAIL_FROM_NAME  = Deno.env.get('MAIL_FROM_NAME') ?? 'FlexMoney';
const MAIL_REPLY_TO   = Deno.env.get('MAIL_REPLY_TO') ?? 'contact@flexmoney.be';
const SITE_URL        = (Deno.env.get('SITE_URL') ?? 'https://www.flexmoney.be').replace(/\/$/, '');
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '*')
  .split(',').map((o) => o.trim()).filter(Boolean);

// ── CORS ──────────────────────────────────────────────────────────
function corsHeaders(origin: string | null): Record<string, string> {
  const allow = ALLOWED_ORIGINS.includes('*')
    ? '*'
    : (origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

// ── Helpers de rendu ──────────────────────────────────────────────
const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Texte multi-ligne → HTML (préserve les sauts de ligne). */
const nl = (v: unknown): string => esc(v).replace(/\r?\n/g, '<br>');

/** Transforme les URLs nues en liens cliquables (après échappement). */
const linkify = (html: string): string =>
  html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#4f46e5;">$1</a>');

const body = (v: unknown): string => linkify(nl(v));

const BRAND = '#6366f1';

/** Gabarit commun : en-tête, contenu, pied de page légal. */
function layout(opts: {
  title: string;
  intro?: string;
  content: string;
  cta?: { url: string; label: string };
  footerNote?: string;
}): string {
  const { title, intro, content, cta, footerNote } = opts;
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(15,23,42,0.08);">
    <tr><td style="background:${BRAND};padding:24px 28px;">
      <div style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.3px;">FlexMoney</div>
      <div style="color:#e0e7ff;font-size:12px;margin-top:2px;">Flexi-jobs en Belgique</div>
    </td></tr>
    <tr><td style="padding:28px;">
      <h1 style="margin:0 0 14px;font-size:19px;line-height:1.35;color:#0f172a;font-weight:700;">${esc(title)}</h1>
      ${intro ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">${intro}</p>` : ''}
      ${content}
      ${cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;"><tr><td style="background:${BRAND};border-radius:10px;">
        <a href="${esc(cta.url)}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">${esc(cta.label)}</a>
      </td></tr></table>
      <p style="margin:10px 0 0;font-size:12px;color:#94a3b8;word-break:break-all;">Si le bouton ne fonctionne pas : ${esc(cta.url)}</p>` : ''}
      ${footerNote ? `<p style="margin:22px 0 0;padding:14px 16px;background:#fef3c7;border-radius:10px;font-size:13px;line-height:1.55;color:#92400e;">${footerNote}</p>` : ''}
    </td></tr>
    <tr><td style="padding:18px 28px 26px;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
        E-mail transactionnel envoyé par FlexMoney suite à votre utilisation du service.<br>
        <a href="${SITE_URL}/politique-confidentialite.html" style="color:#64748b;">Politique de confidentialité</a> ·
        <a href="${SITE_URL}/mentions-legales.html" style="color:#64748b;">Mentions légales</a>
      </p>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

/** Bloc « fiche » clé → valeur. */
function rows(pairs: Array<[string, unknown]>): string {
  const cells = pairs
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '' && String(v) !== '—')
    .map(([k, v]) => `<tr>
      <td style="padding:9px 0;font-size:13px;color:#64748b;width:42%;vertical-align:top;">${esc(k)}</td>
      <td style="padding:9px 0;font-size:14px;color:#0f172a;font-weight:600;">${nl(v)}</td>
    </tr>`).join('');
  if (!cells) return '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:6px 18px;margin:6px 0;">${cells}</table>`;
}

// ── Templates ─────────────────────────────────────────────────────
// Les noms de paramètres reprennent ceux d'EmailJS pour garder les
// appels front identiques.
type Rendered = { subject: string; html: string };
type Params = Record<string, unknown>;

const TEMPLATES: Record<string, (p: Params) => Rendered> = {

  // ex template_y3zn6ll — messages au travailleur (usage générique)
  worker: (p) => ({
    subject: String(p.subject || 'FlexMoney — information sur votre dossier'),
    html: layout({
      title: String(p.subject || `Bonjour ${p.prenom || ''}`.trim()),
      intro: `Bonjour <strong>${esc(p.prenom || p.to_name || '')}</strong>,`,
      content:
        (p.eligible ? `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#0f172a;font-weight:600;">${body(p.eligible)}</p>` : '') +
        (p.competences ? `<div style="font-size:15px;line-height:1.65;color:#334155;">${body(p.competences)}</div>` : '') +
        (p.message ? `<div style="font-size:15px;line-height:1.65;color:#334155;">${body(p.message)}</div>` : ''),
    }),
  }),

  // ex template_0hbqgjd — messages à l'employeur (usage générique)
  employer: (p) => ({
    subject: String(p.subject || (p.entreprise ? `FlexMoney — ${p.entreprise}` : 'FlexMoney — information')),
    html: layout({
      title: String(p.subject || 'Information FlexMoney'),
      intro: `Bonjour <strong>${esc(p.prenom || p.to_name || '')}</strong>,`,
      content:
        rows([['Entreprise', p.entreprise], ['N° BCE', p.bce]]) +
        (p.secteur ? `<div style="font-size:15px;line-height:1.65;color:#334155;margin-top:14px;">${body(p.secteur)}</div>` : '') +
        (p.message ? `<div style="font-size:15px;line-height:1.65;color:#334155;margin-top:14px;">${body(p.message)}</div>` : ''),
      cta: p.dimona_url ? { url: String(p.dimona_url), label: 'Accéder au portail DIMONA' } : undefined,
      footerNote: p.dimona_url
        ? 'Rappel légal : la déclaration DIMONA FLX doit être introduite <strong>avant</strong> le début de chaque prestation. Une réponse NOK interdit la prestation.'
        : undefined,
    }),
  }),

  // ex template_tp6702f — confirmation de mission postée (employeur)
  'mission-posted': (p) => ({
    subject: `Mission publiée : ${p.titre_mission || ''} (réf. ${p.ref_mission || ''})`,
    html: layout({
      title: 'Votre mission est en ligne',
      intro: `Bonjour <strong>${esc(p.prenom || '')}</strong>, votre offre est publiée et visible par les flexi-jobbers correspondants.`,
      content: rows([
        ['Mission', p.titre_mission], ['Référence', p.ref_mission], ['Lieu', p.lieu],
        ['Date', p.date_mission], ['Taux horaire', p.taux_horaire], ['Volume', p.heures],
      ]),
      cta: { url: `${SITE_URL}/dashboard-employeur.html`, label: 'Voir les candidatures' },
    }),
  }),

  // ex template_jsgv5au — alerte nouvelle mission (travailleur matché)
  'mission-alert': (p) => ({
    subject: `Nouvelle mission pour vous : ${p.titre_mission || ''}`,
    html: layout({
      title: 'Une mission correspond à votre profil',
      intro: `Bonjour <strong>${esc(p.prenom || '')}</strong>, une nouvelle offre vient d'être publiée et correspond à vos compétences.`,
      content: rows([
        ['Mission', p.titre_mission], ['Lieu', p.lieu],
        ['Date', p.date_mission], ['Taux horaire', p.taux_horaire ? `${p.taux_horaire} €/h` : ''],
      ]),
      cta: { url: `${SITE_URL}/tableau-missions.html`, label: 'Postuler à cette mission' },
    }),
  }),

  // ex template_lk3kj9n — proposition de créneau / contrat au travailleur
  proposition: (p) => ({
    subject: `${p.entreprise || 'Un employeur'} vous propose : ${p.mission_titre || 'une mission'}`,
    html: layout({
      title: `${p.entreprise || 'Un employeur'} vous propose une mission`,
      intro: `Bonjour <strong>${esc(p.to_name || '')}</strong>, votre candidature a retenu l'attention de <strong>${esc(p.entreprise || '')}</strong>.`,
      content:
        rows([
          ['Mission', p.mission_titre], ['Description', p.description],
          ['Taux horaire', p.taux_horaire], ['Lieu', p.lieu_prestation],
          ['Date', p.date_proposee],
          ['Horaire', p.heure_debut && p.heure_debut !== '—' ? `${p.heure_debut} → ${p.heure_fin}` : ''],
        ]),
      cta: p.lien_confirmation ? { url: String(p.lien_confirmation), label: 'Confirmer ma disponibilité' } : undefined,
      footerNote: 'Vous restez libre d\'accepter ou de refuser. Aucune prestation ne peut débuter avant confirmation et déclaration DIMONA par l\'employeur.',
    }),
  }),

  // ex template_78kr3h6 — nouvelle candidature reçue (employeur)
  candidature: (p) => ({
    subject: `Nouvelle candidature : ${p.candidat_prenom || ''} ${p.candidat_nom || ''} — ${p.mission_titre || ''}`,
    html: layout({
      title: 'Vous avez reçu une candidature',
      intro: `Bonjour <strong>${esc(p.to_name || '')}</strong>, un flexi-jobber a postulé à votre mission <strong>${esc(p.mission_titre || '')}</strong>.`,
      content:
        rows([
          ['Candidat', `${p.candidat_prenom || ''} ${p.candidat_nom || ''}`.trim()],
          ['E-mail', p.candidat_email],
          ['Compétences', p.competences],
          ['Disponibilités', p.disponibilites],
        ]) +
        (p.message && p.message !== 'Aucun message'
          ? `<div style="margin-top:16px;padding:14px 16px;background:#eef2ff;border-left:3px solid ${BRAND};border-radius:0 10px 10px 0;font-size:14px;line-height:1.6;color:#1e293b;"><strong style="display:block;margin-bottom:6px;color:#4338ca;">Message du candidat</strong>${nl(p.message)}</div>`
          : ''),
      cta: { url: `${SITE_URL}/dashboard-employeur.html`, label: 'Examiner la candidature' },
    }),
  }),
};

/** Version texte brut (accessibilité + antispam). */
function toText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|tr|div|h1|table)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n').trim();
}

const isEmail = (v: unknown): v is string =>
  typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

// ── Handler ───────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const cors = corsHeaders(req.headers.get('origin'));
  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status, headers: { ...cors, 'Content-Type': 'application/json' },
    });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);
  if (!BREVO_API_KEY) return json({ error: 'BREVO_API_KEY non configurée' }, 500);

  let payload: Params;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'JSON invalide' }, 400);
  }

  const template = String(payload.template ?? '');
  const params = (payload.params ?? {}) as Params;
  const to = payload.to ?? params.to_email;
  const toName = String(payload.to_name ?? params.to_name ?? '');
  const replyTo = isEmail(payload.reply_to) ? payload.reply_to
    : (isEmail(params.reply_to) ? params.reply_to : MAIL_REPLY_TO);

  const render = TEMPLATES[template];
  if (!render) {
    return json({ error: `Template inconnu : "${template}"`, available: Object.keys(TEMPLATES) }, 400);
  }
  if (!isEmail(to)) return json({ error: 'Destinataire invalide' }, 400);

  let rendered: Rendered;
  try {
    rendered = render(params);
  } catch (e) {
    return json({ error: 'Erreur de rendu du template', detail: String(e) }, 500);
  }

  const brevoBody = {
    sender: { name: MAIL_FROM_NAME, email: MAIL_FROM },
    to: [{ email: to, ...(toName ? { name: toName } : {}) }],
    replyTo: { email: replyTo },
    subject: rendered.subject.slice(0, 200),
    htmlContent: rendered.html,
    textContent: toText(rendered.html),
    tags: [template],
  };

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(brevoBody),
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error('Brevo error', res.status, raw);
      return json({ error: 'Envoi refusé par le fournisseur', status: res.status, detail: raw }, 502);
    }
    let messageId: unknown = null;
    try { messageId = JSON.parse(raw).messageId; } catch { /* réponse vide */ }
    return json({ ok: true, messageId, template });
  } catch (e) {
    console.error('Brevo fetch failed', e);
    return json({ error: 'Fournisseur injoignable', detail: String(e) }, 502);
  }
});
