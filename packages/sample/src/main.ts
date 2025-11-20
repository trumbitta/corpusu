import { Character, Team } from '@corpusu/core';
import { CombatEngine } from '@corpusu/engine';

const teamA = new Team('Heroes', [
  new Character('H1', { attack: 10, dexterity: 0.8, speed: 1, defense: 4 }),
  new Character('H2', { attack: 12, dexterity: 0.7, speed: 1.2, defense: 3 }),
  new Character('H3', { attack: 8, dexterity: 0.9, speed: 0.9, defense: 2 }),
  new Character('H4', { attack: 9, dexterity: 0.75, speed: 1.1, defense: 3 }),
  new Character('H5', { attack: 11, dexterity: 0.8, speed: 1, defense: 2 }),
]);

const teamB = new Team('Enemies', [
  new Character('E1', { attack: 10, dexterity: 0.8, speed: 1, defense: 4 }),
  new Character('E2', { attack: 12, dexterity: 0.7, speed: 1.2, defense: 3 }),
  new Character('E3', { attack: 8, dexterity: 0.9, speed: 0.9, defense: 2 }),
  new Character('E4', { attack: 9, dexterity: 0.75, speed: 1.1, defense: 3 }),
  new Character('E5', { attack: 11, dexterity: 0.8, speed: 1, defense: 2 }),
]);

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
    case 'death':
      console.log(`${event.character.name} is dead`);
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
