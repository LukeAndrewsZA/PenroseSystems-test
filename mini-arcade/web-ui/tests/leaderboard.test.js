import { getLeaderboard, submitScore } from '../src/lib/leaderboard';

test('getLeaderboard returns an array of players', async () => {
  const leaderboard = await getLeaderboard();
  expect(Array.isArray(leaderboard)).toBe(true);
  expect(leaderboard.length).toBeGreaterThan(0);
});

test('submitScore returns success status', async () => {
  const result = await submitScore('TestPlayer', 50);
  expect(result.status).toBe('success');
  expect(result.name).toBe('TestPlayer');
  expect(result.score).toBe(50);
});
