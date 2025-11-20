import { getRandomAnimal } from '@corpusu/animal';
import { formatMessage } from '@corpusu/util';

export function zoo(): string {
  const result = getRandomAnimal();
  const message = `${result.name} says ${result.sound}!`;
  return formatMessage('ZOO', message);
}
