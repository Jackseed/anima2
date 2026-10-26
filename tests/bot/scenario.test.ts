import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { REGIONS, type GameState } from '@anima/engine';
import { doc, getDoc, updateDoc, type Firestore } from 'firebase/firestore';
import { describe, it } from 'vitest';

// Manual testing: `SCENARIO_MATCH=<id> npm run scenario` moves a running game to the last
// round of its era, with the player on turn holding the islands, to watch the end of era.
describe.skipIf(!process.env['SCENARIO_MATCH'])('scenario', () => {
  it('jumps to the end of the era', async () => {
    const env = await initializeTestEnvironment({ projectId: 'demo-anima', firestore: { host: '127.0.0.1', port: 8080 } });
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore() as unknown as Firestore;
      const ref = doc(db, 'matches', process.env['SCENARIO_MATCH']!);
      const match = (await getDoc(ref)).data()!;
      const state = match['state'] as GameState;
      const player = state.players.find((p) => p.id === state.turn!.playerId)!;
      const species = state.species.find((s) => s.id === player.speciesIds[0])!;
      for (const id of REGIONS.find((r) => r.id === 'islands')!.tileIds) species.positions[String(id)] = 1;
      state.round = 3;
      state.era = Number(process.env['SCENARIO_ERA'] ?? state.era);
      await updateDoc(ref, { state, version: match['version'] + 1 });
    });
    await env.cleanup();
  });
});
