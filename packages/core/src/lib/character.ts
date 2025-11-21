import { z } from 'zod';

export const StatsSchema = z.object({
  attack: z.number(),
  dexterity: z.number(),
  speed: z.number(),
  defense: z.number(),
});

export type Stats = z.infer<typeof StatsSchema>;

export function getDamage(attack: number, defense: number) {
  return Math.max(0, attack - Math.floor(defense * 0.5));
}

export class Character {
  public hp: number;
  public readonly maxHp: number;
  private attackBar = 0;
  public readonly id: string;

  constructor(id: string, name: string, stats: Stats, initialHp = 100) {
    this.id = id;
    this.name = name;
    this.stats = stats;
    // Ensure HP is a positive integer and capped at a reasonable max (e.g., 9999)
    this.maxHp = Math.max(1, Math.min(initialHp, 9999));
    this.hp = this.maxHp;
  }

  public readonly name: string;
  public readonly stats: Stats;

  update(delta: number) {
    this.attackBar += this.stats.speed * delta;
  }

  canAttack() {
    return this.attackBar >= 100 && this.hp > 0;
  }

  performAttack(target: Character): { hit: boolean; damage: number } {
    this.attackBar = 0;
    const hit = Math.random() < this.stats.dexterity;
    let damage = 0;

    if (hit) {
      damage = getDamage(this.stats.attack, target.stats.defense);
      target.hp = Math.max(0, target.hp - damage);
    }

    return { hit, damage };
  }
}
