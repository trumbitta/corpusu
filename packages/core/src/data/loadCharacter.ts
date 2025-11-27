export type CharacterData = z.infer<typeof CharacterDataSchema>;
import { Character, StatsSchema } from '../lib/character.js';
import fs from 'fs';
let pathPromise: Promise<typeof import('node:path')> | null = null;
function getPath() {
  if (!pathPromise) pathPromise = import('node:path');
  return pathPromise;
}
import { z } from 'zod';

export const CharacterDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  hp: z.number().int().positive(),
  stats: StatsSchema,
  row: z.enum(['front', 'mid', 'back']).optional(),
  attackType: z.enum(['melee', 'ranged']).optional(),
});

export async function loadCharacterFromFile(
  filePath: string
): Promise<Character> {
  const path = await getPath();
  const absPath = path.resolve(filePath);
  const raw = fs.readFileSync(absPath, 'utf-8');
  let parsed: CharacterData;
  try {
    parsed = CharacterDataSchema.parse(JSON.parse(raw));
  } catch (err) {
    throw new Error(
      `Invalid character data in ${filePath}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
  return new Character(
    parsed.id,
    parsed.name,
    parsed.stats,
    parsed.row ?? 'front',
    parsed.attackType ?? 'melee',
    parsed.hp
  );
}

export async function loadCharactersFromFolder(
  folderPath: string
): Promise<Character[]> {
  const path = await getPath();
  const absFolder = path.resolve(folderPath);
  const files = fs.readdirSync(absFolder).filter((f) => f.endsWith('.json'));
  const characters: Character[] = [];
  for (const f of files) {
    characters.push(await loadCharacterFromFile(path.join(absFolder, f)));
  }
  return characters;
}
