import { Character } from './character.js';

export class Team {
  constructor(public name: string, public members: Character[]) {}

  get alive(): Character[] {
    return this.members.filter((c) => c.hp > 0);
  }

  get isDefeated(): boolean {
    return this.alive.length === 0;
  }
}
