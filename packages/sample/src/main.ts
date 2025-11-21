import { Team } from '@corpusu/core';
import { CombatEngine } from '@corpusu/engine';
import { loadCharactersFromFolder } from '@corpusu/core';
import path from 'node:path';

async function main() {
  const allCharacters = await loadCharactersFromFolder(
    path.resolve(__dirname, '../../../characters')
  );
  const teamA = new Team(
    'Heroes',
    allCharacters.filter((c) => c.name.startsWith('H'))
  );
  const teamB = new Team(
    'Enemies',
    allCharacters.filter((c) => c.name.startsWith('E'))
  );

  const engine = new CombatEngine(teamA, teamB);

  engine.events$.subscribe((event) => {
    switch (event.type) {
      case 'hit':
        console.log(
          `${event.attacker.name} hits ${event.target.name} for ${event.damage} HP`
        );
        break;
      case 'miss':
        console.log(`${event.attacker.name} misses the target`);
        break;
      case 'defeat':
        console.log(`${event.character.name} is defeated`);
        break;
      case 'teamDefeated':
        console.log(`The team ${event.team.name} has been defeated!`);
        break;
    }
  });

  const engineUpdateRatio = 4;
  const updateEngine = () => {
    engine.update(engineUpdateRatio);
  };

  if (engine.running) {
    updateEngine();
  }

  const interval = setInterval(() => {
    updateEngine();
    if (!engine.running) clearInterval(interval);
  }, 10);
}

main();
