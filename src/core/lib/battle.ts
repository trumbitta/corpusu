import { Character, CharacterRow, AttackType } from './character.js';
import { Team } from './team.js';

export type Engagement = {
  attacker: Character;
  defender: Character;
  type: AttackType;
};

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
  tick(delta: number) {
    // Update all characters' attack bars and movement
    for (const team of [this.teamA, this.teamB]) {
      const enemyTeam = team === this.teamA ? this.teamB : this.teamA;
      for (const c of team.alive) {
        if (c.defeated) continue;
        // If engaged, skip movement
        if (!c.engaged) {
          c.update(delta);
          // Movement logic for melee
          if (c.attackType === 'melee') {
            // Find nearest enemy (prefer unengaged)
            const targets: Character[] = enemyTeam.alive.filter(
              (e: Character) => !e.engaged
            );
            if (targets.length === 0) continue;
            // Find closest row
            let minDist = Infinity;
            let closest: Character | null = null;
            for (const e of targets) {
              const dist = Battle.rowDistance(c.currentRow, e.currentRow);
              if (dist < minDist) {
                minDist = dist;
                closest = e;
              }
            }
            if (closest) {
              // Move toward enemy (reduce distance)
              if (minDist > 0) {
                // Move one row closer per tick (could be speed-based)
                // For now, just snap to closest row for simplicity
                c.currentRow = closest.currentRow;
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
          // For melee, must be in same row AND column
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
            const { hit } = c.performAttack(target);
            c.engaged = true;
            if (c.attackType === 'melee') {
              target.engaged = true;
            }
            // If target is defeated, ranged attackers can retarget next tick
            if (hit && target.hp <= 0) {
              target.hp = 0;
              target.engaged = false;
              if (c.attackType === 'ranged') {
                c.engaged = false; // Ranged can resume moving/attacking next tick
              }
            }
          }
        }
      }
    }
  }
}
