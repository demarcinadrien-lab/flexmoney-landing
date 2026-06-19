# DIMONA FLX — Règles & Architecture FlexMoney

## 1. Type de déclaration : FLX

- Type travailleur : **FLX**
- Commission paritaire : **XXX**
- Vérification automatique par l'ONSS de la règle T-3 à la soumission
- Réponse **OK** = le travailleur peut commencer (condition absolue)
- Réponse **NOK** = le travailleur ne peut légalement pas commencer

---

## 2. Deux types de contrat → deux fréquences DIMONA

| Type de contrat | Fréquence DIMONA | Détails requis |
|---|---|---|
| Oral (journalier) | 1 DIMONA par jour | Heure de début + fin obligatoires |
| Écrit (période) | 1 DIMONA par trimestre | + enregistrement de présence séparé |

> Avec contrat écrit : période max = 1 trimestre, déclarable jusqu'à 1 mois à l'avance.

---

## 3. La règle T-3 (éligibilité travailleur)

Le flexi-travailleur doit avoir travaillé **≥ 80%** au trimestre de référence = **T_mission − 3 trimestres**, chez un ou plusieurs **autres** employeurs (pas celui du flexi-job).

**Exemple :**
- Mission en octobre 2026 (T4 2026) → ONSS vérifie T1 2026 (jan–mars)
- Le travailleur doit y avoir travaillé ≥ 80% chez un autre employeur

---

## 4. Règle depuis janvier 2024

Le travailleur **ne peut pas** :
- Avoir eu un autre contrat de travail chez le même employeur
- Cumuler un contrat flexi-job avec un autre contrat chez le même employeur

---

## 5. Recommandation pour FlexMoney

### Option retenue : DIMONA via API (automatisée)

**Pourquoi ?**
- Contrats oraux journaliers incompatibles avec secrétariat social (délai trop court)
- La DIMONA doit être envoyée **avant le début du shift** le jour même
- L'automatisation via API = valeur ajoutée clé de FlexMoney

### Flow proposé

```
Flexi-jobber postule à une mission
        ↓
Employeur accepte (matching confirmé)
        ↓
Flexi-jobber remplit formulaire de conformité :
  - Numéro NISS (numéro national)
  - Date de naissance
  - Statut (salarié 4/5, pensionné, indépendant complémentaire)
  - Upload preuve (contrat principal / fiche de paie / attestation pension)
        ↓
FlexMoney vérifie les données + génère le dossier DIMONA
        ↓
Employeur reçoit confirmation : "Prêt à envoyer la DIMONA"
  → Option A : FlexMoney envoie via API ONSS
  → Option B : FlexMoney génère le formulaire pré-rempli pour l'employeur
        ↓
Réponse ONSS : OK → mission peut commencer / NOK → alerte employeur
```

---

## 6. Données à collecter du travailleur (post-matching)

### Identité DIMONA
- Numéro NISS (format : 00.00.00-000.00)
- Date de naissance
- Adresse complète

### Statut d'éligibilité
- [ ] Salarié à temps plein ou ≥ 4/5 chez employeur principal
- [ ] Pensionné(e)
- [ ] Indépendant complémentaire (cas spécifiques)

### Documents de preuve
- Contrat de travail (employeur principal) — PDF
- OU Fiche de paie récente (T-1 minimum) — PDF
- OU Attestation de pension — PDF

### Données mission (remplies par employeur)
- Date et heure de début
- Date et heure de fin (contrat oral) ou période (contrat écrit)
- Type de contrat : oral / écrit
- Taux horaire flexi convenu

---

## 7. Données techniques pour l'API DIMONA

| Champ | Valeur |
|---|---|
| TypeTravailleur | FLX |
| CommissionParitaire | XXX |
| NISS travailleur | (collecté au step compliance) |
| NISS employeur | (BCE déjà en base) |
| DateDebut | (confirmée à la mission) |
| DateFin | (contrat oral seulement) |
| TypeContrat | ORAL / ECRIT |

---

## 8. Prochaines étapes de développement

1. **Page compliance post-match** : formulaire travailleur (NISS + upload preuve)
2. **Stockage Supabase** : table `dimona_dossiers` + bucket pour les documents
3. **Génération PDF pré-rempli** pour l'employeur (phase 1 sans API directe)
4. **Intégration API ONSS** (phase 2, nécessite agrément mandataire)
