import { describe, it, expect } from 'vitest';
import { Character, getDamage } from './character.js';

describe('getDamage', () => {
  it('should calculate damage correctly', () => {
    expect(getDamage(10, 4)).toBe(8);
    expect(getDamage(10, 10)).toBe(5);
    expect(getDamage(5, 10)).toBe(0);
  });

  it('should never return negative damage', () => {
    expect(getDamage(1, 100)).toBe(0);
  });
});

describe('Character', () => {
  it('should initialize with correct properties and custom HP', () => {
    const char = new Character(
      'Hero',
      {
        attack: 10,
        dexterity: 0.8,
        speed: 1.5,
        defense: 5,
      },
      150
    );

    expect(char.name).toBe('Hero');
    expect(char.hp).toBe(150);
    expect(char.maxHp).toBe(150);
    expect(char.stats.attack).toBe(10);
  });

  it('should update attack bar based on speed', () => {
    const char = new Character('Hero', {
      attack: 10,
      dexterity: 0.8,
      speed: 10,
      defense: 5,
    });

    expect(char.canAttack()).toBe(false);
    char.update(10);
    expect(char.canAttack()).toBe(true);
  });

  it('should not be able to attack when defeated', () => {
    const char = new Character(
      'Hero',
      {
        attack: 10,
        dexterity: 0.8,
        speed: 10,
        defense: 5,
      },
      80
    );

    char.update(10);
    char.hp = 0;
    expect(char.canAttack()).toBe(false);
  });

  it('should reset attack bar after performing attack', () => {
    const attacker = new Character('Attacker', {
      attack: 10,
      dexterity: 1.0,
      speed: 10,
      defense: 5,
    });
    const target = new Character('Target', {
      attack: 10,
      dexterity: 0.8,
      speed: 1,
      defense: 5,
    });

    attacker.update(10);
    expect(attacker.canAttack()).toBe(true);
    attacker.performAttack(target);
    expect(attacker.canAttack()).toBe(false);
  });

  it('should reduce target HP on successful attack', () => {
    const attacker = new Character('Attacker', {
      attack: 20,
      dexterity: 1.0,
      speed: 10,
      defense: 5,
    });
    const target = new Character('Target', {
      attack: 10,
      dexterity: 0.8,
      speed: 1,
      defense: 5,
    });

    const initialHp = target.hp;
    attacker.performAttack(target);
    expect(target.hp).toBeLessThan(initialHp);
  });
});
