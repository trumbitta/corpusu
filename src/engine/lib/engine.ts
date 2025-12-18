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
    // and capture events it produced this tick.
    const events = this.battle.tick(delta);
    // Forward Battle events to engine events$ for the UI
    for (const ev of events) {
      if (ev.type === 'hit') {
        this.events$.next({
          type: 'hit',
          attacker: ev.attacker,
          target: ev.target,
          damage: ev.damage,
        });
      } else if (ev.type === 'miss') {
        this.events$.next({
          type: 'miss',
          attacker: ev.attacker,
          target: ev.target,
        });
      } else if (ev.type === 'defeat') {
        this.events$.next({ type: 'defeat', character: ev.character });
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
