import { describe, it } from 'vitest';
import { Bot } from './bot';

// Manual testing: `BOT_MATCH=<id> npm run bot` joins the game and plays the opponent.
describe.skipIf(!process.env['BOT_MATCH'])('bot opponent', () => {
  it('plays until the end', async () => {
    const bot = new Bot('Robot');
    await bot.signIn();
    const matchId = process.env['BOT_MATCH']!;
    await bot.join(matchId).catch(() => undefined);
    await bot.playUntilFinished(matchId, Number(process.env['BOT_DELAY'] ?? 800));
    await bot.close();
  }, 3_600_000);
});
