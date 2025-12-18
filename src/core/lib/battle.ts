import {
  Character,
  CharacterRow,
  CharacterColumn,
  AttackType,
} from './character.js';
import { Team } from './team.js';

export type Engagement = {
  attacker: Character;
  defender: Character;
  type: AttackType;
};

export type BattleEvent =
  | { type: 'hit'; attacker: Character; target: Character; damage: number }
  | { type: 'miss'; attacker: Character; target: Character }
  | { type: 'defeat'; character: Character };

export class Battle {
  constructor(public teamA: Team, public teamB: Team) {}

  // Distance matrix: front=0, mid=1, back=2
  static rowDistance(a: CharacterRow, b: CharacterRow): number {
    const order: Record<CharacterRow, number> = { front: 0, mid: 1, back: 2 };
    return Math.abs(order[a] - order[b]);
  }

  static columnDistance(a: number, b: number): number {
    return Math.abs(a - b);
  }

  // Main real-time tick
  // Returns an array of BattleEvent describing attacks/defeats that occurred
  tick(
    delta: number
  ): Array<
    | { type: 'hit'; attacker: Character; target: Character; damage: number }
    | { type: 'miss'; attacker: Character; target: Character }
    | { type: 'defeat'; character: Character }
  > {
    const events: Array<
      | { type: 'hit'; attacker: Character; target: Character; damage: number }
      | { type: 'miss'; attacker: Character; target: Character }
      | { type: 'defeat'; character: Character }
    > = [];
    // Update all characters' attack bars and movement
    for (const team of [this.teamA, this.teamB]) {
      const enemyTeam = team === this.teamA ? this.teamB : this.teamA;
      for (const c of team.alive) {
        if (c.defeated) continue;
        // Always update attack bar; movement only happens when not engaged
        c.update(delta);
        if (!c.engaged) {
          // Movement logic for melee
          if (c.attackType === 'melee') {
            // Find nearest unengaged enemy
            const unengagedTargets: Character[] = enemyTeam.alive.filter(
              (e: Character) => !e.engaged
            );
            let closest: Character | null = null;
            if (unengagedTargets.length > 0) {
              // Find closest unengaged target by row + column distance
              let minDist = Infinity;
              for (const e of unengagedTargets) {
                const dist =
                  Battle.rowDistance(c.currentRow, e.currentRow) +
                  Battle.columnDistance(c.currentColumn, e.currentColumn);
                if (dist < minDist) {
                  minDist = dist;
                  closest = e;
                }
              }
            } else {
              // If no unengaged targets, find closest enemy period (even if engaged)
              let minDist = Infinity;
              for (const e of enemyTeam.alive) {
                const dist =
                  Battle.rowDistance(c.currentRow, e.currentRow) +
                  Battle.columnDistance(c.currentColumn, e.currentColumn);
                if (dist < minDist) {
                  minDist = dist;
                  closest = e;
                }
              }
            }
            if (closest) {
              // Move toward enemy (reduce distance)
              // Move one row closer if different
              if (Battle.rowDistance(c.currentRow, closest.currentRow) > 0) {
                const order: Record<CharacterRow, number> = {
                  front: 0,
                  mid: 1,
                  back: 2,
                };
                const rows: CharacterRow[] = ['front', 'mid', 'back'];
                const targetRowIdx = order[closest.currentRow];
                const currentRowIdx = order[c.currentRow];
                c.currentRow =
                  rows[currentRowIdx + (targetRowIdx > currentRowIdx ? 1 : -1)];
              }
              // Move one column closer if different
              if (
                Battle.columnDistance(c.currentColumn, closest.currentColumn) >
                0
              ) {
                const newCol =
                  c.currentColumn +
                  (closest.currentColumn > c.currentColumn ? 1 : -1);
                c.currentColumn = newCol as CharacterColumn;
              }
            }
          }
        }

        // Attack logic
        if (c.canAttack() && !c.defeated) {
          // Targeting: prefer unengaged, then engaged
          let possibleTargets: Character[] = enemyTeam.alive.filter(
            (e: Character) => !e.engaged
          );
          if (possibleTargets.length === 0) {
            possibleTargets = enemyTeam.alive;
          }
          let target: Character | undefined;
          if (c.attackType === 'melee') {
            target = possibleTargets.find(
              (e) =>
                e.currentRow === c.currentRow &&
                e.currentColumn === c.currentColumn
            );
          } else {
            // Ranged: prefer unengaged, fallback to any
            target =
              possibleTargets.find((e) => !e.engaged) || possibleTargets[0];
          }
          if (target) {
            const { hit, damage } = c.performAttack(target);
            c.engaged = true;
            if (c.attackType === 'melee') {
              target.engaged = true;
            }
            if (hit) {
              events.push({ type: 'hit', attacker: c, target, damage });
            } else {
              events.push({ type: 'miss', attacker: c, target });
            }
            // If target is defeated, both melee and ranged can retarget next tick
            if (hit && target.hp <= 0) {
              target.hp = 0;
              target.engaged = false;
              c.engaged = false; // Allow both melee and ranged to find new targets
              events.push({ type: 'defeat', character: target });
            }
          }
        }
      }
    }
    return events;
  }
}
