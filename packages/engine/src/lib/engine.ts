import { Subject } from 'rxjs';
import { Character, Team } from '@corpusu/core';

export type CombatEvent =
  | { type: 'hit'; attacker: Character; target: Character; damage: number }
  | { type: 'miss'; attacker: Character; target: Character }
  | { type: 'death'; character: Character }
  | { type: 'teamDefeated'; team: Team };

export class CombatEngine {
  public events$ = new Subject<CombatEvent>();
  public running = true;

  constructor(public teamA: Team, public teamB: Team) {}

  update(delta: number) {
    if (!this.running) return;

    const allCharacters = [...this.teamA.alive, ...this.teamB.alive];
    allCharacters.forEach((c) => c.update(delta));
    allCharacters.sort((a, b) => b.stats.speed - a.stats.speed);

    for (const c of allCharacters) {
      if (!c.canAttack()) continue;

      const targetTeam = this.teamA.members.includes(c)
        ? this.teamB
        : this.teamA;
      const aliveTargets = targetTeam.alive;
      if (aliveTargets.length === 0) continue;

      const target =
        aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
      const { hit, damage } = c.performAttack(target);

      if (hit) this.events$.next({ type: 'hit', attacker: c, target, damage });
      else this.events$.next({ type: 'miss', attacker: c, target });

      if (target.hp <= 0)
        this.events$.next({ type: 'death', character: target });
    }

    if (this.teamA.isDefeated) {
      this.running = false;
      this.events$.next({ type: 'teamDefeated', team: this.teamA });
    } else if (this.teamB.isDefeated) {
      this.running = false;
      this.events$.next({ type: 'teamDefeated', team: this.teamB });
    }
  }
}
