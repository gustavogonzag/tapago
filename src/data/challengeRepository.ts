import { openDB } from 'idb';
import type { Challenge } from '../domain/challenge';

const database = () => openDB('tapago', 1, {
  upgrade(db) {
    db.createObjectStore('settings');
  },
});

export async function loadChallenge(): Promise<Challenge | null> {
  return (await database()).get('settings', 'activeChallenge') ?? null;
}

export async function saveChallenge(challenge: Challenge): Promise<void> {
  try {
    await (await database()).put('settings', challenge, 'activeChallenge');
  } catch {
    throw new Error('Não foi possível salvar seus dados neste aparelho.');
  }
}

export async function clearChallenge(): Promise<void> {
  await (await database()).delete('settings', 'activeChallenge');
}

export function exportChallenge(challenge: Challenge): string {
  return JSON.stringify(challenge, null, 2);
}

export function parseChallengeBackup(json: string): Challenge {
  try {
    const value: unknown = JSON.parse(json);
    if (!value || typeof value !== 'object' || !Array.isArray((value as Challenge).days) || (value as Challenge).days.length !== 15) {
      throw new Error();
    }
    return value as Challenge;
  } catch {
    throw new Error('Backup inválido');
  }
}
