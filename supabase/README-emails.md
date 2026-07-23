# E-mails transactionnels FlexMoney — Brevo

EmailJS a été remplacé par **Brevo** (Sendinblue SAS, France), appelé depuis une
Edge Function Supabase. La clé API ne quitte jamais le serveur.

```
Page HTML  →  flxSendEmail(template, params)   (shared.js)
           →  POST /functions/v1/send-email     (Edge Function, clé API côté serveur)
           →  API Brevo                         (hébergement UE)
```

---

## 1. Compte Brevo

Compte créé, organisation **Flexmoney**. Domaine `flexmoney.be` ajouté en attente
de vérification, avec le sous-domaine de marque **`em`** (et non `mail`, déjà
occupé par le webmail Combell).

Reste à faire : **SMTP et API → Clés API** → générer une clé v3, à coller
directement dans les secrets Supabase (étape 3). Elle ne s'affiche qu'une fois.

## 2. Enregistrements DNS à créer chez Combell

**Domaine : `flexmoney.be`** — enregistré chez **Combell**, déjà pointé vers Vercel.
Panneau : *Mon Combell → Domaines → flexmoney.be → Paramètres DNS*.

### 2a. Les 7 enregistrements générés par Brevo

| # | Type | Nom | Valeur |
|---|------|-----|--------|
| 1 | CNAME | `em` | `em-flexmoney-be.brand.brevosend.com` |
| 2 | TXT | `@` | `brevo-code:cf1c57ac2c521888fa1b8c745e65aed4` |
| 3 | CNAME | `brevo1._domainkey` | `b1.flexmoney-be.dkim.brevo.com` |
| 4 | CNAME | `brevo2._domainkey` | `b2.flexmoney-be.dkim.brevo.com` |
| 5 | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` |
| 6 | CNAME | `img.em` | `em-flexmoney-be.img.brand.brevosend.com` |
| 7 | CNAME | `r.em` | `em-flexmoney-be.r.brand.brevosend.com` |

Les 1, 6 et 7 servent aux liens et images de suivi à votre marque ; les 3 et 4
portent la signature DKIM ; le 2 prouve la propriété du domaine.

### 2b. Deux pièges à éviter

**Le DMARC (n° 5) doit REMPLACER l'existant, pas s'y ajouter.** Vous avez déjà
`v=DMARC1;p=none;` sur `_dmarc`. Un domaine ne peut porter qu'un seul
enregistrement DMARC : éditez la ligne existante avec la nouvelle valeur.

**Ne touchez pas au SPF.** Brevo ne demande aucune modification SPF dans cette
configuration : l'alignement DMARC est assuré par le DKIM (n° 3 et 4) et par le
Return-Path délégué sur `em.flexmoney.be`. La ligne actuelle
`v=spf1 mx a include:_spf.relay.mailprotect.be ~all` reste telle quelle — y
ajouter Brevo serait inutile, et créer une seconde ligne SPF ferait échouer
**tout** le courrier du domaine, boîtes Combell comprises.

De même, ne touchez ni aux MX (`mx.mailprotect.be`) ni au CNAME `mail`
(webmail Combell) : ils ne sont pas concernés.

### 2c. Vérifier

Propagation : quelques minutes à 24 h. Cliquez ensuite sur **Authentifier le
domaine** dans Brevo. Contrôle en ligne de commande :

```bash
dig +short TXT flexmoney.be                    # brevo-code + SPF inchangé
dig +short CNAME brevo1._domainkey.flexmoney.be
dig +short CNAME em.flexmoney.be
dig +short TXT _dmarc.flexmoney.be             # UNE seule ligne
```

> Une fois les envois stables (quelques semaines), durcissez le DMARC :
> `v=DMARC1; p=quarantine; rua=mailto:dmarc@flexmoney.be`

## 3. Configurer les secrets Supabase

Dashboard → projet **flexmoney** (`rvvybwflrntmdpjrumov`) → **Edge Functions → Secrets** :

| Secret | Valeur | Requis |
|--------|--------|--------|
| `BREVO_API_KEY` | la clé v3 de l'étape 1 | oui |
| `MAIL_FROM` | `no-reply@flexmoney.be` (domaine authentifié) | oui |
| `MAIL_FROM_NAME` | `FlexMoney` | non |
| `MAIL_REPLY_TO` | `contact@flexmoney.be` (boîte Combell) | non |
| `SITE_URL` | `https://www.flexmoney.be` | non |
| `ALLOWED_ORIGINS` | `https://www.flexmoney.be,https://flexmoney.be,https://flexmoney.vercel.app` | recommandé |

## 4. Déployer la fonction

```bash
supabase login
supabase link --project-ref rvvybwflrntmdpjrumov
supabase functions deploy send-email
```

Sans CLI : Dashboard → **Edge Functions → Create function**, nom `send-email`,
puis coller le contenu de `supabase/functions/send-email/index.ts`.

## 5. Tester

```bash
curl -X POST https://rvvybwflrntmdpjrumov.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_d8nE75u5UJ3HqsO5HDXKXQ_um8cvYX9" \
  -d '{"template":"worker","to":"votre@email.be","params":{"prenom":"Adrien","subject":"Test FlexMoney","message":"Ceci est un test."}}'
```

Réponse attendue : `{"ok":true,"messageId":"..."}`.
Journaux en cas d'échec : Dashboard → Edge Functions → `send-email` → **Logs**.

---

## Templates disponibles

Rendus côté serveur dans `index.ts` — versionnés dans git, plus d'éditeur externe.

| Template | Ancien ID EmailJS | Usage |
|----------|-------------------|-------|
| `worker` | `template_y3zn6ll` | messages au travailleur (bienvenue, contestation, dossier Jour J) |
| `employer` | `template_0hbqgjd` | messages à l'employeur (bienvenue, heures à valider, contrat signé) |
| `mission-posted` | `template_tp6702f` | confirmation de mission publiée |
| `mission-alert` | `template_jsgv5au` | alerte aux travailleurs matchés |
| `proposition` | `template_lk3kj9n` | proposition de créneau / contrat au travailleur |
| `candidature` | `template_78kr3h6` | nouvelle candidature reçue |

Les noms de paramètres sont inchangés (`to_email`, `prenom`, `mission_titre`…),
les appels front n'ont donc pas eu à être réécrits.

### Ajouter un template

Dans `index.ts`, ajouter une entrée à `TEMPLATES` puis une clé à `FLX_TPL`
dans `shared.js`. Le gabarit `layout()` fournit l'en-tête, le bouton d'action
et le pied de page légal.

---

## Points d'attention

- **Quota** : offre gratuite Brevo = 300 e-mails/jour. `poster-mission.html`
  notifie jusqu'à 10 travailleurs par mission : à surveiller à la montée en charge.
- **Envois en masse** : les alertes mission partent en boucle côté client
  (un appel par destinataire). À basculer vers un envoi groupé côté serveur
  si le volume augmente.
- **Non bloquant** : tous les appels sont dans des `try/catch` — un échec d'e-mail
  n'interrompt jamais une inscription ou une signature.
- **RGPD** : Brevo est un sous-traitant au sens de l'art. 28. Signez le DPA
  (Brevo → Compte → **Data Processing Agreement**) et conservez-le.
