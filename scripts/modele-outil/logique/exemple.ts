import type { Exemple } from '../types.ts';
import { TAILLE_MAX_EXEMPLE } from '../constantes.ts';

// La logique métier vit ici, en TypeScript pur (sans Svelte, sans DOM si possible) : elle se teste sans navigateur.
export function normaliser(e: Exemple): Exemple {
	return { texte: e.texte.trim().slice(0, TAILLE_MAX_EXEMPLE) };
}
