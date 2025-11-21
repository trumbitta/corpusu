# corpusu Repository Status & Features

## Combat Engine Design

- **Not Turn-Based**: The combat engine is not strictly turn-based. Instead, it uses a real-time "action bar" or "speed bar" mechanic, similar to games like *Saint Seiya Legend of Justice*.
- **Action Bar System**: Each character has an attack bar that fills over time, based on their speed stat. When the bar reaches a threshold, the character can act (attack).
- **Simultaneous Progression**: All characters' bars fill simultaneously, and the fastest characters act more frequently.
- **Combat Flow**:
  - Characters from both teams update their attack bars every tick.
  - When a character's bar is full, they attack a random alive enemy.
  - Attacks can hit or miss, and may result in a character's death.
  - The engine emits events for hits, misses, deaths, and team defeat.
  - The battle continues until one team is defeated.
- **Game Inspiration**: This system is inspired by "Saint Seiya Legend of Justice" and similar RPGs, which use real-time action bars rather than strict turn order.

## Features Summary

- **core**: Defines `Character` and `Team` with stats, HP, attack logic, and alive/dead status.
- **engine**: Implements a real-time combat engine with action bar mechanics, event emission, and win/loss conditions.
- **sample**: Demonstrates a battle between two teams using the engine, logging events to the console.

## Development Notes

- The engine is suitable for games with dynamic, speed-based combat rather than classic turn-based systems.
- Future enhancements could include skills, buffs, debuffs, and more complex targeting logic.

---

This file accurately reflects the real-time, action bar-based combat system inspired by Saint Seiya Legend of Justice. Update as needed for future features or changes.
