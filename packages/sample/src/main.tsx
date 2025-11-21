import { CombatEngine } from '@corpusu/engine';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { useEffect, useState } from 'react';
import { render, Box, Text } from 'ink';
import BigText from 'ink-big-text';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TEAM_A_EMOJI = '🟥';
const TEAM_B_EMOJI = '🟦';
const DEFEATED_EMOJI = '😵';

import type { Character } from '@corpusu/core';
import type { Team } from '@corpusu/core';

interface TeamAreaProps {
  team: Team;
  defeated: Set<string>;
  color: string;
  emoji: string;
  label: string;
}

function TeamArea({ team, defeated, color, emoji, label }: TeamAreaProps) {
  return (
    <Box flexDirection="column" alignItems="flex-end" marginRight={4}>
      <Text bold>{`${emoji} ${label}`}</Text>
      {team.members.map((c: Character) => {
        // Right-align name and HP by padding name to 20 chars, HP to 5 chars (left pad with two spaces)
        const name = c.name.padStart(20, ' ');
        const hpWidth = 5;
        const hp = String(c.hp).padStart(hpWidth, ' ');
        let hpColumn;
        if (defeated.has(c.name)) {
          // Pad left so emoji is right-aligned in the HP column
          hpColumn = ` | HP: ${' '.repeat(hpWidth - 2)}${DEFEATED_EMOJI}`;
        } else {
          hpColumn = ` | HP: ${hp}`;
        }
        return (
          <Text
            key={c.name}
            color={defeated.has(c.name) ? 'gray' : color}
            bold={defeated.has(c.name)}
          >
            {name}
            {hpColumn}
          </Text>
        );
      })}
    </Box>
  );
}

function EventLog({ events }: { events: string[] }) {
  // Render victory/shoutout messages with custom style
  // Check for victory/shoutout messages
  const last = events[events.length - 1];
  if (typeof last === 'string' && last.endsWith('wins!')) {
    // Find shoutout if present
    const shoutout =
      events[events.length - 2] && events[events.length - 2].startsWith('🏆')
        ? events[events.length - 2]
        : null;
    return (
      <Box flexDirection="column" alignItems="center" marginTop={2}>
        <BigText text={last} font="block" />
        {shoutout && (
          <Text color="cyan" bold>
            {' '.repeat(4)}
            {shoutout}
            {' '.repeat(4)}
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" alignItems="center" marginTop={2}>
      {events.slice(-3).map((ev, i, arr) => (
        <Text
          key={i}
          bold={i === arr.length - 1}
          color={i === arr.length - 1 ? 'yellow' : 'white'}
        >
          {ev}
        </Text>
      ))}
    </Box>
  );
}

interface AppProps {
  teamA: Team;
  teamB: Team;
  engine: CombatEngine;
}
const App = ({ teamA, teamB, engine }: AppProps) => {
  const [events, setEvents] = useState<string[]>([]);
  const [defeated, setDefeated] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);

  useEffect(() => {
    const damageMap: Record<string, number> = {};
    type EventType =
      | { type: 'hit'; attacker: Character; target: Character; damage: number }
      | { type: 'miss'; attacker: Character }
      | { type: 'defeat'; character: Character }
      | { type: 'teamDefeated'; team: Team };
    const sub = engine.events$.subscribe((event: EventType) => {
      let log = '';
      switch (event.type) {
        case 'hit': {
          log = `${event.attacker.name} → 💥 → ${
            event.target.name
          } for ${String(event.damage).padStart(3)} HP`;
          damageMap[event.attacker.name] =
            (damageMap[event.attacker.name] || 0) + event.damage;
          break;
        }
        case 'miss': {
          log = `${event.attacker.name} → misses the target`;
          break;
        }
        case 'defeat': {
          log = `${DEFEATED_EMOJI} ${event.character.name} is defeated!`;
          setDefeated((prev) => new Set(prev).add(event.character.name));
          break;
        }
        case 'teamDefeated': {
          const defeatedTeam = event.team.name;
          const winningTeam = defeatedTeam === 'Team A' ? 'Team B' : 'Team A';
          const winningEmoji =
            winningTeam === 'Team A' ? TEAM_A_EMOJI : TEAM_B_EMOJI;
          const topDealerEntry = Object.entries(damageMap).sort(
            (a, b) => b[1] - a[1]
          )[0];
          const topDealerName = topDealerEntry?.[0] || '';
          const topDealerDamage = topDealerEntry?.[1] || 0;
          setEvents((ev) => [
            ...ev,
            `🏆 ${topDealerName} of ${winningEmoji} ${winningTeam} dealt the most damage (${topDealerDamage} HP)!`,
            `${winningTeam} wins!`,
          ]);
          break;
        }
      }
      if (log) setEvents((ev) => [...ev, log]);
      setTick((t) => t + 1); // force update for HP changes
    });
    return () => sub.unsubscribe();
  }, [engine]);

  useEffect(() => {
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
    return () => clearInterval(interval);
  }, [engine]);

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={2}
    >
      <Box flexDirection="row" alignItems="flex-start" justifyContent="center">
        <TeamArea
          team={teamA}
          defeated={defeated}
          color="red"
          emoji={TEAM_A_EMOJI}
          label="Team A"
        />
        <TeamArea
          team={teamB}
          defeated={defeated}
          color="blue"
          emoji={TEAM_B_EMOJI}
          label="Team B"
        />
      </Box>
      <EventLog events={events} />
    </Box>
  );
};

async function main() {
  const core = await import('@corpusu/core');
  const { Team, loadCharactersFromFolder } = core;
  // Character type is inferred from loader
  const allCharacters = await loadCharactersFromFolder(
    path.resolve(__dirname, 'characters')
  );
  const teamAIds = ['C1', 'C2', 'C3', 'C4', 'C5'];
  const teamBIds = ['C6', 'C7', 'C8', 'C9', 'C10'];
  const teamA = new Team(
    'Team A',
    allCharacters.filter((c) => teamAIds.includes(c.id))
  );
  const teamB = new Team(
    'Team B',
    allCharacters.filter((c) => teamBIds.includes(c.id))
  );
  const engine = new CombatEngine(teamA, teamB);
  render(<App teamA={teamA} teamB={teamB} engine={engine} />);
}

main();
