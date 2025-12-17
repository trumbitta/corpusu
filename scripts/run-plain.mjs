#!/usr/bin/env node
import path from 'node:path';
const dist = await import(path.resolve('dist/index.js'));
const { loadCharactersFromFolder, Team, Battle } = dist;

async function main() {
  const chars = await loadCharactersFromFolder(path.resolve('src/core/data/characters'));
  const teamA = new Team('Team A', chars.slice(0, 5));
  const teamB = new Team('Team B', chars.slice(5, 10));
  const battle = new Battle(teamA, teamB);
  console.log('Starting plain CLI battle between Team A and Team B');
  const interval = setInterval(() => {
    battle.tick(4);
    for (const t of [teamA, teamB]) {
      console.log(`${t.name} alive: ${t.alive.map((c) => `${c.name}(${c.hp})`).join(', ')}`);
    }
    if (teamA.isDefeated || teamB.isDefeated) {
      clearInterval(interval);
      console.log('Battle finished');
    }
  }, 200);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
