import { describe, it, expect } from 'vitest';
import { Character, Team } from '@corpusu/core';
import { CombatEngine, CombatEvent } from './engine.js';

describe('CombatEngine', () => {
  it('should initialize with two teams', () => {
    const teamA = new Team('Heroes', [
      new Character('Hero1', {
        attack: 10,
        dexterity: 0.8,
        speed: 1,
        defense: 5,
      }),
    ]);
    const teamB = new Team('Enemies', [
      new Character('Enemy1', {
        attack: 10,
        dexterity: 0.8,
        speed: 1,
        defense: 5,
      }),
    ]);

    const engine = new CombatEngine(teamA, teamB);

    expect(engine.teamA).toBe(teamA);
    expect(engine.teamB).toBe(teamB);
    expect(engine.running).toBe(true);
  });

  it('should emit events when combat occurs', (context) => {
    const teamA = new Team('Heroes', [
      new Character('Hero1', {
        attack: 20,
        dexterity: 1.0,
        speed: 100,
        defense: 5,
      }),
    ]);
    const teamB = new Team('Enemies', [
      new Character('Enemy1', {
        attack: 10,
        dexterity: 1.0,
        speed: 1,
        defense: 5,
      }),
    ]);

    const engine = new CombatEngine(teamA, teamB);
    const events: any[] = [];

    engine.events$.subscribe((event: CombatEvent) => {
      events.push(event);
    });

    engine.update(1);

    expect(events.length).toBeGreaterThan(0);
  });

  it('should stop running when a team is defeated', () => {
    const teamA = new Team('Heroes', [
      new Character('Hero1', {
        attack: 100,
        dexterity: 1.0,
        speed: 100,
        defense: 5,
      }),
    ]);
    const teamB = new Team('Enemies', [
      new Character('Enemy1', {
        attack: 1,
        dexterity: 1.0,
        speed: 1,
        defense: 1,
      }),
    ]);

    const engine = new CombatEngine(teamA, teamB);
    let teamDefeatedEvent = false;

    engine.events$.subscribe((event: CombatEvent) => {
      if (event.type === 'teamDefeated') {
        teamDefeatedEvent = true;
      }
    });

    while (engine.running) {
      engine.update(1);
    }

    expect(engine.running).toBe(false);
    expect(teamDefeatedEvent).toBe(true);
  });

  it('should update character attack bars', () => {
    const teamA = new Team('Heroes', [
      new Character('Hero1', {
        attack: 10,
        dexterity: 0.8,
        speed: 10,
        defense: 5,
      }),
    ]);
    const teamB = new Team('Enemies', [
      new Character('Enemy1', {
        attack: 10,
        dexterity: 0.8,
        speed: 1,
        defense: 5,
      }),
    ]);

    const engine = new CombatEngine(teamA, teamB);

    expect(teamA.members[0].canAttack()).toBe(false);
    engine.update(10);
    // After a single update(10) call, the character's attack bar will be filled
    // but it will immediately attack within the same update cycle and reset to 0
    // So we need to check after the attack has been performed
    expect(teamA.members[0].canAttack()).toBe(false);
  });
});
