import { CombatEngine } from '@corpusu/engine';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const core = await import('@corpusu/core');
  const { Team, loadCharactersFromFolder } = core;
  type CharacterType = {
    name: string;
    stats: import('@corpusu/core').Stats;
    hp: number;
    maxHp: number;
  };
  const allCharacters = await loadCharactersFromFolder(
    path.resolve(__dirname, 'characters')
  );
  const heroNames = [
    'Arion Stormguard',
    'Lyra Sunfire',
    'Kael Swiftwind',
    'Mira Ironheart',
    'Darius Nightblade',
  ];
  const enemyNames = [
    'Malakar the Dread',
    'Vexis Shadowblade',
    'Zarnok the Cruel',
    'Tharion Bloodfang',
    'Krynn the Wraith',
  ];
  const teamA = new Team(
    'Heroes',
    allCharacters.filter((c: CharacterType) => heroNames.includes(c.name))
  );
  const teamB = new Team(
    'Enemies',
    allCharacters.filter((c: CharacterType) => enemyNames.includes(c.name))
  );

  const engine = new CombatEngine(teamA, teamB);

  // Helper for fixed-width name and HP
  function formatChar(char: import('@corpusu/core').Character) {
    const defeated = char.hp === 0;
    const skull = defeated ? ' 💀' : '';
    return `${char.name.padEnd(20)}${skull} | HP: ${String(char.hp).padStart(
      3
    )}`;
  }

  function printStatus() {
    console.log('\n--- Current Status ---');
    console.log('Team A:');
    teamA.members.forEach((c) => {
      console.log('  ' + formatChar(c));
    });
    console.log('Team B:');
    teamB.members.forEach((c) => {
      console.log('  ' + formatChar(c));
    });
    console.log('---------------------\n');
  }

  // Track total damage dealt
  const damageMap: Record<string, number> = {};

  engine.events$.subscribe((event) => {
    switch (event.type) {
      case 'hit': {
        // Removed unused attackerTeam and targetTeam
        console.log(
          `${formatChar(event.attacker)} → hits → ${formatChar(
            event.target
          )} for ${String(event.damage).padStart(3)} HP`
        );
        damageMap[event.attacker.name] =
          (damageMap[event.attacker.name] || 0) + event.damage;
        printStatus();
        break;
      }
      case 'miss': {
        // Removed unused attackerTeam
        console.log(`${formatChar(event.attacker)} → misses the target`);
        printStatus();
        break;
      }
      case 'defeat': {
        // Removed unused team
        console.log(`${formatChar(event.character)} is defeated!`);
        printStatus();
        break;
      }
      case 'teamDefeated': {
        console.log(`The team ${event.team.name} has been defeated!`);
        printStatus();
        // Shoutout top damage dealer
        const topDealer = Object.entries(damageMap).sort(
          (a, b) => b[1] - a[1]
        )[0];
        if (topDealer) {
          console.log(
            `🏆 Shoutout: ${topDealer[0]} dealt the most damage (${topDealer[1]} HP)!`
          );
        }
        break;
      }
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
