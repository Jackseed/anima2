import { afterAll, describe, expect, it } from 'vitest';
import { Bot } from './bot';

// Two clients play a whole game through the Firestore emulator, with the security rules on.
describe('a full game between two clients', () => {
  const alice = new Bot('Alice');
  const bob = new Bot('Bob');

  afterAll(async () => {
    await alice.close();
    await bob.close();
  });

  it('reaches the end with every move accepted by the rules', async () => {
    await alice.signIn();
    await bob.signIn();
    const matchId = await alice.create('E2E');
    await bob.join(matchId);
    const [final] = await Promise.all([alice.playUntilFinished(matchId), bob.playUntilFinished(matchId)]);
    expect(final.phase).toBe('finished');
    expect([alice.uid, bob.uid]).toContain(final.winner!.playerId);
  }, 240_000);
});
