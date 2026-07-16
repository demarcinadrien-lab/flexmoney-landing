/**
 * FlexMoney — Modèles de contrats flexi-job (texte pré-rempli, éditable par l'employeur)
 * Deux documents :
 *   • Contrat CADRE  : accord-cadre signé une seule fois par paire employeur / travailleur
 *   • Contrat TRIMESTRIEL : contrat à durée déterminée, basé sur le contrat-cadre
 * Fichier central utilisé par : mes-travailleurs.html, tableau-travailleurs.html, signer-contrat.html
 */

function _cm_champ(v) { return (v === null || v === undefined || v === '') ? '________________' : v; }

function _cm_dateFR(d) {
  if (!d) return '________________';
  const x = new Date(d);
  return isNaN(x.getTime()) ? String(d) : x.toLocaleDateString('fr-BE', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Accord-cadre flexi-job — signé une seule fois entre l'employeur et le travailleur
function construireContratCadreTexte(d) {
  const g = _cm_champ;
  return `CONTRAT-CADRE FLEXI-JOB
Conforme à la loi du 24 décembre 2016 relative au flexi-job, modifiée par la loi du 12 mai 2026

ARTICLE 1 — PARTIES
L'EMPLOYEUR
Dénomination : ${g(d.entreprise)}
BCE : ${g(d.bce)}
Siège social : ${g(d.siege)}
Représenté par : ${g(d.representant)}
Commission paritaire : ${g(d.cp)}

LE TRAVAILLEUR FLEXI
Nom et prénom : ${g(d.wNom)}
Date de naissance : ${g(d.wDdn)}
Adresse : ${g(d.wAdresse)}
Statut principal : ${g(d.wStatut)}

ARTICLE 2 — OBJET DU CONTRAT-CADRE
Le présent contrat-cadre organise, pour une durée indéterminée, les occupations flexi-job successives du travailleur auprès de l'employeur. Chaque occupation fera l'objet d'un contrat de travail flexi-job à durée déterminée (contrat trimestriel), conclu en exécution du présent contrat-cadre.

ARTICLE 3 — CONDITIONS D'ÉLIGIBILITÉ
Le travailleur déclare remplir les conditions légales du régime flexi-job et être occupé à ${g(d.wStatut)} chez son employeur principal durant le trimestre de référence. Il s'engage à informer l'employeur de toute perte d'éligibilité.

ARTICLE 4 — CONDITIONS GÉNÉRALES DE TRAVAIL
Une déclaration Dimona FLX est effectuée par l'employeur avant chaque prestation. La rémunération est le flexi-salaire majoré du flexi-pécule de vacances (7,67 %), dans le respect du minimum légal. L'employeur garantit une assurance accidents du travail couvrant les prestations flexi-job.

ARTICLE 5 — DURÉE ET RÉSILIATION
Le contrat-cadre prend effet à sa signature et reste valable tant que la relation flexi-job se poursuit. Il peut être résilié par écrit par l'une ou l'autre des parties, sans préjudice des contrats trimestriels en cours.

ARTICLE 6 — DISPOSITIONS LÉGALES
Le présent contrat-cadre est régi par la loi belge relative au travail flexi-job. Pour tout litige, les tribunaux du travail du lieu de travail sont compétents. FlexMoney intervient uniquement comme intermédiaire technique et ne prélève aucune commission.`;
}

// Contrat trimestriel — à durée déterminée, en exécution du contrat-cadre
function construireContratTrimestrielTexte(d) {
  const g = _cm_champ;
  const refCadre = d.cadreSigneLe
    ? `Le présent contrat est conclu en exécution du contrat-cadre flexi-job signé le ${_cm_dateFR(d.cadreSigneLe)}.`
    : `Le présent contrat est conclu en exécution du contrat-cadre flexi-job signé entre les parties.`;
  return `CONTRAT DE TRAVAIL FLEXI-JOB (TRIMESTRIEL)
Conforme à la loi du 24 décembre 2016 relative au flexi-job, modifiée par la loi du 12 mai 2026

ARTICLE 1 — PARTIES
L'EMPLOYEUR
Dénomination : ${g(d.entreprise)}
BCE : ${g(d.bce)}
Siège social : ${g(d.siege)}
Représenté par : ${g(d.representant)}
Commission paritaire : ${g(d.cp)}

LE TRAVAILLEUR FLEXI
Nom et prénom : ${g(d.wNom)}
Date de naissance : ${g(d.wDdn)}
Adresse : ${g(d.wAdresse)}
Statut principal : ${g(d.wStatut)}

ARTICLE 2 — OBJET ET NATURE
Contrat de travail flexi-job à durée déterminée. ${refCadre}

ARTICLE 3 — MISSION ET LIEU
Fonction : ${g(d.fonction)}
Description : ${g(d.description)}
Lieu de travail : ${g(d.lieu)}

ARTICLE 4 — DURÉE
Le contrat est conclu du ${_cm_dateFR(d.dateDebut)} au ${_cm_dateFR(d.dateFin)}. Les journées de travail sont proposées à l'intérieur de cette période, dans la limite de 3 mois.

ARTICLE 5 — RÉMUNÉRATION
Le taux horaire brut flexi est de ${g(d.taux)}, incluant le flexi-pécule de vacances (7,67 %), conformément à la législation. Aucune commission n'est prélevée par FlexMoney.

ARTICLE 6 — DISPOSITIONS LÉGALES
Une déclaration Dimona FLX est effectuée par l'employeur avant chaque prestation. Le contrat est régi par la loi belge relative au travail flexi-job. Pour tout litige, les tribunaux du travail du lieu de travail sont compétents.`;
}
