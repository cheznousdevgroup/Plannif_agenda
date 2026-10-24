import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normaliser } from './exemple.ts';

// Lancé par `npm test`. Les imports internes gardent l'extension .ts (Node les exécute directement).
test('normaliser retire les espaces autour du texte', () => {
	assert.equal(normaliser({ texte: '  bonjour ' }).texte, 'bonjour');
});
