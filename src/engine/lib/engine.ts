import { Subject } from 'rxjs';
import { Character, Team, Battle } from '../../core/index.js';

export type CombatEvent =
  | { type: 'hit'; attacker: Character; target: Character; damage: number }
  | { type: 'miss'; attacker: Character; target: Character }
  | { type: 'defeat'; character: Character }
  | { type: 'teamDefeated'; team: Team };

export class CombatEngine {
  public events$ = new Subject<CombatEvent>();
  public running = true;
  private battle: Battle;

  constructor(public teamA: Team, public teamB: Team) {
    this.battle = new Battle(teamA, teamB);
  }

  update(delta: number) {
    if (!this.running) return;

    // Use Battle class for movement, positioning, and tactical targeting
    this.battle.tick(delta);

    // Track events from attack results by checking HP changes
    // (This is a simplified event emission; a more robust system would
    // track events directly from Battle.tick())
    const allCharacters = [...this.teamA.alive, ...this.teamB.alive];
    for (const c of allCharacters) {
      if (c.defeated) {
        // Could emit defeat events here if tracking previous state
      }
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
