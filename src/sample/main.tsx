// Local type for Team-like objects (matches @corpusu/core Team)
type TeamLike = {
  name: string;
  members: Character[];
  alive: Character[];
  isDefeated: boolean;
};

import { CombatEngine } from '../engine/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { useEffect, useState } from 'react';
import type { CharacterRow } from '../core/index.js';
// Milliseconds between engine update ticks (controls real-time battle speed)
const ENGINE_INTERVAL_DELAY = 100;
import { render, Box, Text } from 'ink';
import BigText from './ink-big-text-shim.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TEAM_A_EMOJI = '🟥';
const TEAM_B_EMOJI = '🟦';
const DEFEATED_EMOJI = '😵';

import type { Character } from '../core/index.js';

// Extend Character type to include possible runtime properties
type CharacterWithRuntime = Character & {
  engaged?: boolean;
  currentRow?: string;
};

interface TeamAreaProps {
  team: TeamLike; // Team is loaded dynamically
  defeated: Set<string>;
  color: string;
  emoji: string;
  label: string;
}

function TeamArea({ team, defeated, color, emoji, label }: TeamAreaProps) {
  return (
    <Box flexDirection="column" alignItems="flex-end" marginRight={4}>
      <Text bold>{`${emoji} ${label}`}</Text>
      {team.members.map((c: CharacterWithRuntime) => {
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
        // Show engaged and current row status
        let status = '';
        if (!defeated.has(c.name)) {
          if (c.engaged) status += ' ⚔️';
          if (c.currentRow && c.currentRow !== c.row) {
            status += ` [${c.currentRow.charAt(0).toUpperCase()}]`;
          } else {
            status += ` [${c.row.charAt(0).toUpperCase()}]`;
          }
        }
        return (
          <Text
            key={c.name}
            color={defeated.has(c.name) ? 'gray' : color}
            bold={defeated.has(c.name)}
          >
            {name}
            {hpColumn}
            {status}
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
  teamA: TeamLike;
  teamB: TeamLike;
  engine: CombatEngine;
}

// 3x3 battle grid visualization (3 rows x 3 columns)
function BattleGrid({ teamA, teamB }: { teamA: TeamLike; teamB: TeamLike }) {
  const rowLabels = ['Front', 'Mid', 'Back'];
  const rowKeys: CharacterRow[] = ['front', 'mid', 'back'];

  // Build a map of position -> character(s)
  const gridMap: Record<string, CharacterWithRuntime[]> = {};
  for (const row of rowKeys) {
    for (let col = 0; col < 3; col++) {
      gridMap[`${row}-${col}`] = [];
    }
  }

  for (const team of [teamA, teamB]) {
    for (const c of team.members) {
      if (!c.defeated) {
        const key = `${c.currentRow}-${c.currentColumn}`;
        if (gridMap[key]) gridMap[key].push(c);
      }
    }
  }

  return (
    <Box
      flexDirection="column"
      marginY={1}
      borderStyle="double"
      borderColor="cyan"
      padding={1}
    >
      <Text color="cyan" bold>
        ⚔ Battle Grid ⚔
      </Text>
      {rowKeys.map((row, rowIdx) => (
        <Box key={row} flexDirection="row">
          <Box width={6} paddingRight={1}>
            <Text color="blue" bold>
              {rowLabels[rowIdx]}
            </Text>
          </Box>
          {[0, 1, 2].map((col) => {
            const key = `${row}-${col}`;
            const chars = gridMap[key] || [];
            const cellContent =
              chars.length > 0
                ? chars
                    .map((c) => {
                      const emoji = c.name.includes(teamA.name) ? '🔴' : '🔵';
                      return `${emoji}${c.name.substring(0, 3)}`;
                    })
                    .join('|')
                : '·';
            return (
              <Box
                key={`${row}-${col}`}
                width={16}
                borderStyle="single"
                borderColor="gray"
                paddingX={1}
              >
                <Text>{cellContent}</Text>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
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
      | { type: 'teamDefeated'; team: TeamLike }; // Team is loaded dynamically
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
    }, ENGINE_INTERVAL_DELAY);
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
      <BattleGrid teamA={teamA} teamB={teamB} />
      <EventLog events={events} />
    </Box>
  );
};

import { useInput } from 'ink';

function TeamSelection({
  available,
  cpuTeam,
  onSelect,
}: {
  available: Character[];
  cpuTeam: Character[];
  onSelect: (team: Character[]) => void;
}) {
  // Interactive multi-select state
  const teamSize = 5;
  const cardsPerRow = 3;
  const visibleRows = 2;
  const [cursor, setCursor] = useState(0);
  const [windowStartRow, setWindowStartRow] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  // Helper to calculate placement and check if adding a character would exceed row limits
  const canAddCharacter = (newSelected: Set<string>): boolean => {
    const selectedChars = available.filter((c) => newSelected.has(c.id));
    const rowCounts = { front: 0, mid: 0, back: 0 };
    for (const c of selectedChars) {
      rowCounts[c.row as keyof typeof rowCounts]++;
      if (rowCounts[c.row as keyof typeof rowCounts] > 3) {
        return false;
      }
    }
    return true;
  };

  useInput((input, key) => {
    if (confirmExit) {
      if (key.escape) {
        setConfirmExit(false);
        return;
      }
      if (key.return) {
        process.exit(0);
      }
      return;
    }
    if (confirmed) return;
    if (input === 'q') {
      setConfirmExit(true);
      return;
    }
    if (key.leftArrow) {
      setCursor((c) =>
        c % cardsPerRow === 0
          ? Math.min(c + cardsPerRow - 1, available.length - 1)
          : c - 1
      );
    } else if (key.rightArrow) {
      setCursor((c) =>
        c % cardsPerRow === cardsPerRow - 1 || c === available.length - 1
          ? c - (cardsPerRow - 1) >= 0
            ? c - (cardsPerRow - 1)
            : 0
          : Math.min(c + 1, available.length - 1)
      );
    } else if (key.upArrow) {
      setCursor((c) => {
        const row = Math.floor(c / cardsPerRow);
        if (row === windowStartRow) {
          if (windowStartRow > 0) {
            setWindowStartRow((prev) => prev - 1);
            return c - cardsPerRow >= 0 ? c - cardsPerRow : c;
          } else {
            return c;
          }
        } else {
          return c - cardsPerRow >= 0 ? c - cardsPerRow : c;
        }
      });
    } else if (key.downArrow) {
      setCursor((c) => {
        const row = Math.floor(c / cardsPerRow);
        const maxRow = Math.ceil(available.length / cardsPerRow) - 1;
        if (row === windowStartRow + visibleRows - 1) {
          if (windowStartRow + visibleRows - 1 < maxRow) {
            setWindowStartRow((prev) => prev + 1);
            return c + cardsPerRow < available.length ? c + cardsPerRow : c;
          } else {
            return c;
          }
        } else {
          return c + cardsPerRow < available.length ? c + cardsPerRow : c;
        }
      });
    } else if (input === ' ' || key.return) {
      const id = available[cursor].id;
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else if (next.size < teamSize) {
          // Check if adding this character would exceed row limits
          next.add(id);
          if (!canAddCharacter(next)) {
            next.delete(id);
          }
        }
        return next;
      });
    } else if (input === 'c' && selected.size === teamSize) {
      setConfirmed(true);
      onSelect(available.filter((c) => selected.has(c.id)));
    }
  });

  // Calculate window start index for rendering
  const start = windowStartRow * cardsPerRow;
  const end = Math.min(start + cardsPerRow * visibleRows, available.length);

  return (
    <Box flexDirection="column" alignItems="center" marginTop={2}>
      <Text color="blue" bold>
        CPU Team:
      </Text>
      {cpuTeam.map((c) => (
        <Text key={c.id}>
          {c.name} (HP: {c.hp}, ATK: {c.stats.attack}, DEF: {c.stats.defense},
          SPD: {c.stats.speed}, DEX: {c.stats.dexterity})
        </Text>
      ))}
      <Box marginTop={1}>
        <Text color="green" bold>
          Select your team (choose {teamSize}):
        </Text>
      </Box>
      <Box flexDirection="column" marginY={1}>
        {Array.from({ length: visibleRows }).map((_, rowIdx) => {
          const rowStart = start + rowIdx * cardsPerRow;
          if (rowStart >= end) return null;
          return (
            <Box key={rowIdx} flexDirection="row" justifyContent="center">
              {Array.from({ length: cardsPerRow }).map((_, colIdx) => {
                const idx = rowStart + colIdx;
                if (idx >= end)
                  return <Box key={colIdx} width={26} height={6} />;
                const c = available[idx];
                const isCursor = idx === cursor;
                const isSelected = selected.has(c.id);
                return (
                  <Box
                    key={c.id}
                    flexDirection="column"
                    // Only horizontal borders
                    borderStyle="single"
                    borderTop={true}
                    borderBottom={true}
                    borderLeft={false}
                    borderRight={false}
                    borderColor={
                      isSelected ? 'cyan' : isCursor ? 'yellow' : 'gray'
                    }
                    marginX={1}
                    paddingX={1}
                    paddingY={0}
                    width={26}
                    minHeight={6}
                    height={6}
                    justifyContent="flex-start"
                  >
                    <Text bold color={isSelected ? 'cyan' : undefined}>
                      {isSelected ? '●' : '○'} {c.name}{' '}
                      <Text bold color="white">
                        {c.row === 'front'
                          ? 'F'
                          : c.row === 'mid'
                          ? 'M'
                          : c.row === 'back'
                          ? 'B'
                          : '?'}
                      </Text>{' '}
                      <Text
                        bold
                        color={c.attackType === 'ranged' ? 'magenta' : 'green'}
                      >
                        {c.attackType === 'ranged' ? '⚡️' : '👊'}
                      </Text>
                    </Text>
                    <Text>
                      HP: {c.hp} ATK: {c.stats.attack} DEF: {c.stats.defense}
                    </Text>
                    <Text>
                      SPD: {c.stats.speed} DEX: {c.stats.dexterity}
                    </Text>
                    {isCursor && (
                      <Text color="yellow">
                        {isSelected ? 'Selected' : 'Not selected'}
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
      <Text color="gray">
        Use ↑/↓ to scroll, space/enter to select, 'c' to confirm, 'q' to quit.
      </Text>
      {confirmExit && (
        <Text color="red" bold>
          Are you sure you want to quit? Press Enter to confirm, Esc to cancel.
        </Text>
      )}
      <Text color={selected.size === teamSize ? 'green' : 'red'}>
        {selected.size} / {teamSize} selected
      </Text>
      {confirmed && (
        <Text color="green" bold>
          Team confirmed!
        </Text>
      )}
    </Box>
  );
}

function GameFlow({ allCharacters }: { allCharacters: Character[] }) {
  const cpuTeamSize = 5;
  const shuffle = (arr: Character[]) =>
    arr
      .map((v) => [Math.random(), v] as [number, Character])
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => v);
  const [phase, setPhase] = useState<'select' | 'battle'>('select');
  const [cpuTeam, setCpuTeam] = useState<Character[]>([]);
  const [playerTeam, setPlayerTeam] = useState<Character[]>([]);
  const [TeamClass, setTeamClass] = useState<
    null | (new (name: string, members: Character[]) => TeamLike)
  >(null);

  useEffect(() => {
    // CPU picks first
    const shuffled = shuffle(allCharacters);
    setCpuTeam(shuffled.slice(0, cpuTeamSize));
    // Dynamically import Team class
    import('../core/index.js').then((mod) => setTeamClass(() => mod.Team));
  }, [allCharacters]);

  if (phase === 'select' || !TeamClass) {
    return (
      <TeamSelection
        available={allCharacters.filter(
          (c) => !cpuTeam.some((cpu) => cpu.id === c.id)
        )}
        cpuTeam={cpuTeam}
        onSelect={(team) => {
          setPlayerTeam(team);
          setPhase('battle');
        }}
      />
    );
  }

  // After selection, run the battle
  const playerTeamObj = TeamClass
    ? (new TeamClass('Player', playerTeam) as TeamLike)
    : undefined;
  const cpuTeamObj = TeamClass
    ? (new TeamClass('CPU', cpuTeam) as TeamLike)
    : undefined;
  if (!playerTeamObj || !cpuTeamObj) return null;
  const engine = new CombatEngine(playerTeamObj, cpuTeamObj);
  return (
    <App
      teamA={playerTeamObj as TeamLike}
      teamB={cpuTeamObj as TeamLike}
      engine={engine}
    />
  );
}

async function main() {
  const core = await import('../core/index.js');
  const { loadCharactersFromFolder } = core;
  // Use process.cwd() to get the workspace root, then resolve the characters path
  const characterPath = path.resolve(
    process.cwd(),
    'src',
    'core',
    'data',
    'characters'
  );
  const allCharacters = await loadCharactersFromFolder(characterPath);
  render(<GameFlow allCharacters={allCharacters} />);
}

main();
