# Audit de conformité législative — FlexMoney
## Référence : Loi du 12 mai 2026 (DOC 56 1526/001) + Loi originale du 16 novembre 2015

> Dernière mise à jour : 28 juin 2026  
> Statut : **3 points conformes · 1 correction à faire · 2 points à surveiller**

---

## ✅ Ce que nous faisons correctement

### 1. DIMONA FLX avant la prestation
**Exigence légale :** La DIMONA de type FLX doit être envoyée AVANT le début de chaque prestation.  
**Notre implémentation :** Le dossier Jour J (`dossier-jour-j.html`) génère une fiche DIMONA FLX pré-remplie et rappelle explicitement à l'employeur qu'il doit la soumettre avant que le travailleur commence. Email automatique envoyé à l'employeur avec avertissement.  
✅ **Conforme**

### 2. Contrat-cadre et contrat de travail
**Exigence légale :** Un contrat-cadre signé est requis. Un contrat de travail individuel peut être conclu à l'avance pour les prestations récurrentes.  
**Notre implémentation :** Le dossier Jour J génère automatiquement les deux documents (contrat-cadre + contrat de travail trimestriel) pré-remplis avec les données de la candidature. Zone de signature incluse.  
✅ **Conforme**

### 3. Calcul du salaire
**Exigence légale :**
- Minimum 11,87 €/h depuis le 1er mars 2026
- Pécule de vacances : 7,67% du salaire flexi
- Cotisation patronale ONSS : 28% sur (salaire + pécule)
- Brut = net pour le travailleur (pas de cotisations personnelles)

**Notre implémentation (`declaration-heures.html`, `dossier-jour-j.html`) :**
```
salaire      = heures × taux
pécule       = salaire × 7,67%
totalWorker  = salaire + pécule  (brut = net)
cotisations  = totalWorker × 28%
coutTotal    = totalWorker + cotisations
```
Alerte affichée si `taux < 11,87 €`.  
✅ **Conforme**

### 4. Condition T (situation principale)
**Exigence légale :** Le travailleur doit justifier d'une occupation principale (au moins 4/5 chez un autre employeur, ou être retraité, ou indépendant complémentaire, ou fonctionnaire à 4/5) au trimestre T.  
**Notre implémentation :** `compliance.html` collecte une déclaration sur l'honneur du travailleur sur sa situation principale, avec collecte du NISS et des documents justificatifs uploadés dans Supabase Storage.  
✅ **Conforme** *(note : la vérification effective se fait via DmfA — hors scope de notre MVP)*

### 5. Plafond fiscal
**Exigence légale :** Exonération fiscale jusqu'à 18 440 € en 2026.  
**Notre implémentation :** Mention du plafond dans `declaration-heures.html` via `PLAFOND_FISCAL = 18440`. Avertissement prévu dans le calcul.  
✅ **Conforme**

### 6. Droits sociaux dans tous les secteurs
**Exigence légale (loi 12 mai 2026) :** Les flexi-jobbers acquièrent des droits sociaux dans TOUS les secteurs.  
**Notre implémentation :** Mentionné dans `compliance.html` et dans le marketing (`Marketing_Avantages_FlexiJob.md`).  
✅ **Conforme**

---

## ⚠️ Correction nécessaire

### 7. Plafond des 150% — à corriger dans la validation du taux

**Exigence légale avant la loi du 12 mai 2026 :**  
Le flexi-salaire total ne pouvait pas dépasser 150% du salaire barémique minimum.

**Nouvelle règle (loi 12 mai 2026, art. 6+) :**  
La limite de 150% s'applique uniquement au **salaire de base**, pas au flexi-salaire total. Les primes légalement obligatoires et d'application générale chez l'employeur ne sont plus plafonnées.

**Impact sur notre code :**  
Dans `dossier-jour-j.html` et `declaration-heures.html`, quand on indique à l'employeur le taux maximum autorisé, on doit préciser :
- Le TAUX HORAIRE DE BASE est plafonné à 150% du minimum barémique du secteur (CP)
- Les primes conventionnelles s'ajoutent au-dessus et ne sont plus plafonnées

**Action à faire :**  
1. Mettre à jour le texte explicatif dans `dossier-jour-j.html` pour distinguer "salaire de base" vs "flexi-salaire total avec primes"
2. Lors de la mise à jour des taux par CP en juillet 2026, intégrer le calcul du plafond correct : `tauxMaxBase = tauxMinCP × 1.5`
3. Ne pas bloquer les taux qui dépassent ce plafond si l'écart est justifié par des primes conventionnelles

**Gravité : modérée** — Sous-plafond, nous ne risquons pas d'infraction. Sur-plafond, un taux horaire très élevé pourrait être légalement justifié par des primes et nous ne devons pas le rejeter.

---

## ℹ️ Points de vigilance (non bloquants pour le MVP)

### 8. Travailleurs à temps plein et entreprises affiliées

**Nouvelle règle (loi 12 mai 2026) :** L'interdiction de travailler en flexi-job dans une entreprise liée à son employeur principal **ne s'applique plus aux travailleurs à temps plein**.

**Situation actuelle :** Notre formulaire de compliance demande si le travailleur exerce dans une entreprise affiliée, mais ne distingue pas temps plein / temps partiel.

**Impact :** Un travailleur à temps plein (100%) chez l'employeur A peut maintenant légalement travailler en flexi chez une filiale de A. Notre plateforme le refuserait actuellement si la question est posée de façon binaire.

**Action à faire :** Mettre à jour la question dans `compliance.html` pour préciser : "Votre entreprise principale est-elle liée à l'employeur flexi ? Si oui, êtes-vous engagé à temps plein (100%) ?"

**Gravité : faible pour le MVP** — Peu de cas concernés, le travailleur peut toujours s'inscrire et justifier via déclaration sur l'honneur.

### 9. Secteur public (nouveau depuis 1er juillet 2026)

**Nouvelle règle :** Les employeurs publics peuvent recruter des flexi-jobbers (contractuels uniquement, pas de statutaires).

**Situation actuelle :** Notre `poster-mission.html` ne distingue pas secteur privé/public. Un employeur public peut s'inscrire, mais nous ne vérifions pas que le poste proposé est contractuel.

**Action à faire (post-MVP) :** Ajouter un champ "type d'employeur" et, si public, afficher un avertissement que seules les fonctions contractuelles sont autorisées en flexi-job.

**Gravité : faible pour le MVP** — L'accord ou le refus relève de la responsabilité de l'employeur. Nous pouvons ajouter un disclaimer.

### 10. Exclusions sectorielles

**Règle :** Les fonctions artistiques (loi 16/12/2022) et les professions de santé réglementées sont exclues du régime flexi-job.

**Situation actuelle :** Nous ne filtrons pas par secteur d'activité à l'inscription employeur.

**Action à faire (post-MVP) :** Ajouter une vérification du secteur CP à l'inscription pour bloquer les secteurs exclus (artistique, santé réglementée).

**Gravité : faible** — Les employeurs concernés peuvent s'inscrire par erreur. Un disclaimer légal couvre notre responsabilité dans les CGU.

---

## Synthèse

| Point | Statut | Priorité |
|---|---|---|
| DIMONA FLX avant prestation | ✅ Conforme | — |
| Contrat-cadre + contrat de travail | ✅ Conforme | — |
| Calcul salaire (min 11,87€, pécule, ONSS) | ✅ Conforme | — |
| Condition T (occupation principale) | ✅ Conforme | — |
| Plafond fiscal 18 440 € | ✅ Conforme | — |
| Droits sociaux tous secteurs | ✅ Conforme | — |
| **Plafond 150% sur salaire de base uniquement** | **⚠️ À corriger** | **Juillet 2026** |
| Temps plein + entreprise affiliée | ℹ️ Nuance à ajouter | Post-MVP |
| Secteur public (contractuels uniquement) | ℹ️ Disclaimer à ajouter | Post-MVP |
| Exclusions sectorielles (art, santé) | ℹ️ Filtre à ajouter | Post-MVP |

---

## Ce que nous ne gérons pas (hors scope MVP — à externaliser)

- **Vérification DmfA** : La condition T se vérifie officiellement via la Déclaration multifonctionnelle — nous nous reposons sur la déclaration sur l'honneur du travailleur. La responsabilité légale en cas de fausse déclaration repose sur le travailleur et l'employeur.
- **Suivi du plafond fiscal** : Nous calculons le plafond mais ne suivons pas le cumul annuel du travailleur sur plusieurs employeurs.
- **Opt-out sectoriel** : Nous ne vérifions pas si le CP de l'employeur a fait une demande d'opt-out.

Ces points doivent figurer dans les **Conditions Générales d'Utilisation** comme responsabilités déléguées à l'employeur et au travailleur.
