import 'fake-indexeddb/auto';
import { beforeEach, expect, it } from 'vitest';
import { createEmptyChallenge } from '../domain/challenge';
import { clearChallenge, loadChallenge, parseChallengeBackup, saveChallenge } from './challengeRepository';

beforeEach(async () => {
  await clearChallenge();
});

it('round-trips the active challenge through IndexedDB', async () => {
  const challenge = createEmptyChallenge('2026-09-13');
  await saveChallenge(challenge);
  await expect(loadChallenge()).resolves.toEqual(challenge);
});

it('rejects a backup without fifteen days', () => {
  expect(() => parseChallengeBackup('{"days":[]}')).toThrow('Backup inválido');
});
