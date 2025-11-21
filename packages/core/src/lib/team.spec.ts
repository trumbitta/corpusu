import { describe, it, expect } from 'vitest';
import { Character } from './character.js';
import { Team } from './team.js';

describe('Team', () => {
  it('should initialize with correct properties', () => {
    const members = [
      new Character('Hero1', {
        attack: 10,
        dexterity: 0.8,
        speed: 1,
        defense: 5,
      }),
      new Character('Hero2', {
        attack: 12,
        dexterity: 0.7,
        speed: 1.2,
        defense: 4,
      }),
    ];
    const team = new Team('Heroes', members);

    expect(team.name).toBe('Heroes');
    expect(team.members).toHaveLength(2);
  });

  it('should return all alive members', () => {
    const members = [
      new Character('Hero1', {
        attack: 10,
        dexterity: 0.8,
        speed: 1,
        defense: 5,
      }),
      new Character('Hero2', {
        attack: 12,
        dexterity: 0.7,
        speed: 1.2,
        defense: 4,
      }),
    ];
    const team = new Team('Heroes', members);

    expect(team.alive).toHaveLength(2);
    members[0].hp = 0;
    expect(team.alive).toHaveLength(1);
  });

  it('should be defeated when all members are defeated', () => {
    const members = [
      new Character('Hero1', {
        attack: 10,
        dexterity: 0.8,
        speed: 1,
        defense: 5,
      }),
      new Character('Hero2', {
        attack: 12,
        dexterity: 0.7,
        speed: 1.2,
        defense: 4,
      }),
    ];
    const team = new Team('Heroes', members);

    expect(team.isDefeated).toBe(false);
    members[0].hp = 0;
    expect(team.isDefeated).toBe(false);
    members[1].hp = 0;
    expect(team.isDefeated).toBe(true);
  });

  it('should not be defeated when at least one member is alive', () => {
    const members = [
      new Character('Hero1', {
        attack: 10,
        dexterity: 0.8,
        speed: 1,
        defense: 5,
      }),
      new Character('Hero2', {
        attack: 12,
        dexterity: 0.7,
        speed: 1.2,
        defense: 4,
      }),
    ];
    const team = new Team('Heroes', members);

    members[0].hp = 0;
    expect(team.isDefeated).toBe(false);
    expect(team.alive).toHaveLength(1);
  });
});
