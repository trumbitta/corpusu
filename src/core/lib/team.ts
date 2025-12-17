import { Character } from './character.js';

export class Team {
  constructor(public name: string, public members: Character[]) {
    if (members.length > 5) {
      throw new Error('A team cannot have more than 5 characters.');
    }
    const rowCounts: Record<string, number> = { front: 0, mid: 0, back: 0 };
    for (const c of members) {
      rowCounts[c.row] = (rowCounts[c.row] || 0) + 1;
      if (rowCounts[c.row] > 3) {
        throw new Error(
          `A team cannot have more than 3 characters in the ${c.row} row.`
        );
      }
    }
  }

  get alive(): Character[] {
    return this.members.filter((c) => c.hp > 0);
  }

  get isDefeated(): boolean {
    return this.alive.length === 0;
  }
}
