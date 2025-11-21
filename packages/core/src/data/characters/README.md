# Character Data Format

Each character is defined in a separate JSON file. Example schema:

```json
{
  "name": "H1",
  "hp": 120,
  "stats": {
    "attack": 10,
    "dexterity": 0.8,
    "speed": 1,
    "defense": 4
  }
}
```

- `name`: Character name (string)
- `hp`: Initial/max HP (integer)
- `stats`: Object containing attack, dexterity, speed, defense

Add new characters by creating additional JSON files in this folder.
