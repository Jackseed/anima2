import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { REGIONS, type GameState } from '@anima/engine';
import { doc, getDoc, updateDoc, type Firestore } from 'firebase/firestore';
import { describe, it } from 'vitest';

// Manual testing on a running game: `SCENARIO_MATCH=<id> npm run scenario` moves it to the last
// round of its era, with the player on turn holding the islands, to watch the end of era.
// With SCENARIO_KIND=actions, the player on turn gets a crowded tile to try every action.
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
      if (process.env['SCENARIO_KIND'] === 'actions') {
        // Plains (6,9) with two neutrals, and more individuals next door at (7,9).
        species.positions = { '114': 6, '115': 2 };
        species.abilityIds = ['giantism', 'intimidate', 'rallying'];
        const neutrals = state.species.filter((s) => s.ownerId === 'neutral');
        neutrals[0].positions = { '114': 2 };
        neutrals[1].positions = { '114': 1 };
        state.turn!.remainingActions = 2;
        state.turn!.migrationPointsUsed = 0;
      } else {
        for (const id of REGIONS.find((r) => r.id === 'islands')!.tileIds) species.positions[String(id)] = 1;
        state.round = 3;
        state.era = Number(process.env['SCENARIO_ERA'] ?? state.era);
      }
      await updateDoc(ref, { state, version: match['version'] + 1 });
    });
    await env.cleanup();
  });
});
