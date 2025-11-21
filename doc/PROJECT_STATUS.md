# corpusu Repository Status & Features

## Combat Engine Design

- **Not Turn-Based**: The combat engine is not strictly turn-based. Instead, it uses a real-time "action bar" or "speed bar" mechanic, similar to games like _Saint Seiya Legend of Justice_.
- **Action Bar System**: Each character has an attack bar that fills over time, based on their speed stat. When the bar reaches a threshold, the character can act (attack).
- **Simultaneous Progression**: All characters' bars fill simultaneously, and the fastest characters act more frequently.
- **Combat Flow**:
  - Characters from both teams update their attack bars every tick.
  - When a character's bar is full, they attack a random alive enemy.
  - Attacks can hit or miss, and may result in a character's defeat.
  - The engine emits events for hits, misses, defeats, and team defeat.
  - The battle continues until one team is defeated.
- **Game Inspiration**: This system is inspired by "Saint Seiya Legend of Justice" and similar RPGs, which use real-time action bars rather than strict turn order.

## Features Summary

- **core**: Defines `Character` and `Team` with configurable HP and stats. HP is set per character, allowing for diverse builds. Roles (tank, DPS, support, etc.) are not fixed, but emerge naturally from stat combinations and user choices. Attack logic and alive/defeated status are stat-driven.
- **engine**: Implements a real-time combat engine with action bar mechanics, event emission, and win/loss conditions.
- **sample**: Demonstrates a battle between two teams using the engine, logging events to the console and rendering a TUI with Ink.

## Latest Additions

- **Unique Character IDs**: All character selection and filtering now use unique IDs (C1–C10) instead of names. JSON files and codebase updated for this change.
- **Character JSON Renaming**: All character data files are now named C1.json–C10.json for consistency.
- **TUI Alignment Fixes**: The Ink-based TUI now keeps HP and defeated emoji perfectly aligned for all characters.
- **Persistent Event Log**: The event log in the TUI persists and highlights the latest event.
- **Defeated Status by Event**: Defeated characters are tracked by event, not just HP, and are visually grayed out and marked with a dizzy emoji.

## Development Notes

- Characters support configurable HP via constructor, with validation for positive values and reasonable caps.
- Roles are emergent: no hardcoded role property; playstyle and effectiveness are determined by stats and player choices.
- The engine is suitable for games with dynamic, speed-based combat rather than classic turn-based systems.
- Future enhancements could include skills, buffs, debuffs, and more complex targeting logic.

---

This file accurately reflects the real-time, action bar-based combat system inspired by Saint Seiya Legend of Justice. Update as needed for future features or changes.
