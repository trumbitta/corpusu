import { Character } from './character.js';

export class Team {
  constructor(public name: string, public members: Character[]) {
    if (members.length > 5) {
      throw new Error('A team cannot have more than 5 characters.');
    }
    // Auto-assign row/column positions and validate placement
    const rowCounts: Record<string, number> = { front: 0, mid: 0, back: 0 };
    const columnCounts: Record<string, Record<number, number>> = {
      front: { 0: 0, 1: 0, 2: 0 },
      mid: { 0: 0, 1: 0, 2: 0 },
      back: { 0: 0, 1: 0, 2: 0 },
    };

    // Auto-assign row/column if not already set
    for (const c of members) {
      // Auto-assign row if needed (fill front first, then mid, then back)
      if (rowCounts['front'] < 3) {
        c.row = 'front';
      } else if (rowCounts['mid'] < 3) {
        c.row = 'mid';
      } else {
        c.row = 'back';
      }

      // Auto-assign column if needed (0, 1, 2)
      const row = c.row as string;
      if (columnCounts[row][0] < 1) {
        c.column = 0;
        columnCounts[row][0]++;
      } else if (columnCounts[row][1] < 1) {
        c.column = 1;
        columnCounts[row][1]++;
      } else if (columnCounts[row][2] < 1) {
        c.column = 2;
        columnCounts[row][2]++;
      }

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
