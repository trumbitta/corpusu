import { describe, it, expect } from 'vitest';
import { Character, defaultGetDamage } from './character.js';

describe('defaultGetDamage', () => {
  it('should calculate damage correctly', () => {
    const attacker = { attack: 10, dexterity: 0.8, speed: 1, defense: 0 };
    const defender = { attack: 0, dexterity: 0, speed: 0, defense: 4 };
    expect(defaultGetDamage(attacker, defender)).toBe(8);

    const defender2 = { attack: 0, dexterity: 0, speed: 0, defense: 10 };
    expect(defaultGetDamage(attacker, defender2)).toBe(5);

    const attacker2 = { attack: 5, dexterity: 0.8, speed: 1, defense: 0 };
    expect(defaultGetDamage(attacker2, defender2)).toBe(0);
  });

  it('should never return negative damage', () => {
    const attacker = { attack: 1, dexterity: 0.8, speed: 1, defense: 0 };
    const defender = { attack: 0, dexterity: 0, speed: 0, defense: 100 };
    expect(defaultGetDamage(attacker, defender)).toBe(0);
  });
});

describe('Character', () => {
  it('should initialize with correct properties and custom HP', () => {
    const char = new Character(
      'T1',
      'Hero',
      {
        attack: 10,
        dexterity: 0.8,
        speed: 1.5,
        defense: 5,
      },
      'front',
      'melee',
      150
    );

    expect(char.id).toBe('T1');
    expect(char.name).toBe('Hero');
    expect(char.hp).toBe(150);
    expect(char.maxHp).toBe(150);
    expect(char.stats.attack).toBe(10);
  });

  it('should update attack bar based on speed', () => {
    const char = new Character(
      'T2',
      'Hero',
      {
        attack: 10,
        dexterity: 0.8,
        speed: 10,
        defense: 5,
      },
      'front',
      'melee'
    );

    expect(char.canAttack()).toBe(false);
    char.update(10);
    expect(char.canAttack()).toBe(true);
  });

  it('should not be able to attack when defeated', () => {
    const char = new Character(
      'T3',
      'Hero',
      {
        attack: 10,
        dexterity: 0.8,
        speed: 10,
        defense: 5,
      },
      'front',
      'melee',
      80
    );

    char.update(10);
    char.hp = 0;
    expect(char.canAttack()).toBe(false);
  });

  it('should reset attack bar after performing attack', () => {
    const attacker = new Character(
      'T4',
      'Attacker',
      {
        attack: 10,
        dexterity: 1.0,
        speed: 10,
        defense: 5,
      },
      'front',
      'melee'
    );
    const target = new Character(
      'T5',
      'Target',
      {
        attack: 10,
        dexterity: 0.8,
        speed: 1,
        defense: 5,
      },
      'front',
      'melee'
    );

    attacker.update(10);
    expect(attacker.canAttack()).toBe(true);
    attacker.performAttack(target);
    expect(attacker.canAttack()).toBe(false);
  });

  it('should reduce target HP on successful attack', () => {
    const attacker = new Character(
      'T6',
      'Attacker',
      {
        attack: 20,
        dexterity: 1.0,
        speed: 10,
        defense: 5,
      },
      'front',
      'melee'
    );
    const target = new Character(
      'T7',
      'Target',
      {
        attack: 10,
        dexterity: 0.8,
        speed: 1,
        defense: 5,
      },
      'front',
      'melee'
    );

    const initialHp = target.hp;
    attacker.performAttack(target);
    expect(target.hp).toBeLessThan(initialHp);
  });
});
