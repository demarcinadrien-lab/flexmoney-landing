# Plan de test manuel — FlexMoney (avant lancement)

Base de départ : **vierge** (0 compte, 0 mission). Site : https://www.flexmoney.be

Deux comptes à créer :
- **Employeur** : `demarcin.adrien+employeur@outlook.com`
- **Travailleur** : `demarcin.adrien+worker@outlook.com`

> Après chaque étape, dis « fait » : je vérifie la ligne créée en base **et** l'e-mail
> correspondant dans le journal Brevo. Coche au fur et à mesure.

---

## Étape 1 — Inscription employeur
Page : `inscription-employeur.html`
- [ ] Créer l'entreprise (nom, BCE, secteur, e-mail employeur ci-dessus).
- **Attendu base** : 1 ligne dans `employers_inscription` + 1 dans `auth.users`.
- **Attendu e-mail** : « Bienvenue sur FlexMoney » (template *employer*) avec le rappel DIMONA.

## Étape 2 — Publication d'une mission
Page : `poster-mission.html` (connecté employeur)
- [ ] Poster une mission. Note le **secteur** choisi.
- **Attendu base** : 1 ligne dans `missions`.
- **Attendu e-mail** : confirmation « Mission publiée » (template *mission-posted*) à l'employeur.
  (Aucune alerte travailleur encore — personne d'inscrit.)

## Étape 3 — Inscription travailleur
Page : `inscription-travailleur.html`
- [ ] Créer le profil avec des **compétences du même secteur** que la mission (sinon pas de match).
- **Attendu base** : 1 ligne dans `workers_inscription` + 1 dans `auth.users`.
- **Attendu e-mail** : « Bienvenue » (template *worker*).

## Étape 4 — Candidature à la mission
Page : `tableau-missions.html` (connecté travailleur)
- [ ] Trouver la mission, postuler (ajouter un message).
- **Attendu base** : 1 ligne dans `candidatures`.
- **Attendu e-mail** : « Nouvelle candidature » (template *candidature*) à **l'employeur**.

## Étape 5 — Proposition de créneau
Page : `dashboard-employeur.html` (connecté employeur)
- [ ] Voir la candidature, proposer un créneau / accepter.
- **Attendu base** : `candidatures.statut` mis à jour.
- **Attendu e-mail** : « proposition de mission » (template *proposition*) au **travailleur**,
  avec le bouton de confirmation.

## Étape 6 — Confirmation + signature du contrat
Pages : `confirmation-creneau.html` (lien de l'e-mail) puis `signer-contrat.html`
- [ ] Confirmer la disponibilité, relire le contrat, signer en ligne.
- **Attendu base** : `candidatures` → `acceptee`, ligne dans `contrats_cadre`, PDF dans le bucket Storage.
- **Attendu e-mail** : « Contrat signé » (template *employer*) à l'employeur, avec le lien PDF.

## Étape 7 — Déclaration des heures
Page : `declaration-heures.html` (connecté travailleur)
- [ ] Déclarer les heures prestées.
- **Attendu base** : 1 ligne dans `declarations_heures`.
- **Attendu e-mail** : récapitulatif des heures (template *employer*) à l'employeur.

## Étape 8 — Conformité / DIMONA
Pages : `dossier-jour-j.html`, `compliance.html`, `validation-mission.html`
- [ ] Ouvrir le dossier Jour J, vérifier la fiche DIMONA pré-remplie et les rappels légaux.
- [ ] (Optionnel) Tester la **contestation** d'heures côté employeur → e-mail de contestation au travailleur.
- **Attendu base** : `dimona_dossiers` selon le parcours.

---

## Points de contrôle transverses
- [ ] **Expéditeur** de tous les e-mails = `FlexMoney <no-reply@flexmoney.be>`, pas un nom Brevo.
- [ ] Aucun e-mail en spam (sinon le sortir manuellement).
- [ ] Les liens dans les e-mails pointent vers `https://www.flexmoney.be/...` (pas vercel.app).
- [ ] Signature **DKIM = pass**, domaine `d=flexmoney.be` (Outlook → détails du message).
- [ ] Bandeau cookies affiché une fois, puis mémorisé.
- [ ] Mentions légales / confidentialité / CGU accessibles depuis le pied de page.

## Remise à zéro
Après les tests, je peux **vider les tables** (workers, employers, missions, candidatures,
contrats, heures, dimona) et **supprimer les comptes auth** pour repartir 100 % propre
avant le lancement réel. Dis-le-moi quand tu as fini.
