// Les exports d'agenda Outlook ne portent aucun fuseau : on les lit à l'heure de l'établissement qui les édite.
export const FUSEAU_PLANNING = 'Europe/Paris';
export const LANGUE_AFFICHAGE = 'fr-FR';

export const PRODID_ICS = '-//Utilo//Planning vers agenda//FR';
export const DOMAINE_UID_ICS = 'utilo';
export const NOM_FICHIER_ICS = 'planning.ics';

// Un QR code lisible à la caméra d'un téléphone tient autour de 1 700 caractères ; au-delà on découpe en plusieurs QR.
export const TAILLE_MAX_LIEN_QR = 1700;
// Limites appliquées à tout lien reçu : il vient d'un inconnu, on ne décompresse et n'affiche pas n'importe quoi.
export const MAX_EVENEMENTS_LIEN = 500;
export const MAX_TEXTE_LIEN = 500;
export const MAX_CARACTERES_LIEN = 30_000;
export const MAX_OCTETS_DECOMPRESSES = 300_000;
export const VERSION_FORMAT_LIEN = 1;

export const ROUTE_RECEPTION = 'recevoir';

export const MS_MINUTE = 60_000;
export const MS_JOUR = 86_400_000;
