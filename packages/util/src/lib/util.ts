export function util(): string {
  return 'util';
}

export function formatMessage(prefix: string, message: string): string {
  return `[${prefix}] ${message}`;
}

export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
