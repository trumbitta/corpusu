export type Stats = {
  attack: number;
  dexterity: number;
  speed: number;
  defense: number;
};

export function getDamage(attack: number, defense: number) {
  return Math.max(0, attack - Math.floor(defense * 0.5));
}

export class Character {
  hp = 100;
  private attackBar = 0;

  constructor(public name: string, public stats: Stats) {}

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
