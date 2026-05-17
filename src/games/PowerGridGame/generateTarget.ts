import type { Digits } from '../../constants';

export function generateTarget(): Digits {
  const startWhole = Math.floor(Math.random() * 4);
  const hasParts = Math.random() > 0.3;
  let endPart = 3;
  if (hasParts) {
    endPart = 4 + Math.floor(Math.random() * 3);
  }

  const target: Digits = [0, 0, 0, 0, 0, 0, 0];

  for (let i = startWhole; i <= 3; i++) {
    if (i === startWhole && i !== 3) {
      target[i] = Math.floor(Math.random() * 9) + 1;
    } else {
      target[i] = Math.floor(Math.random() * 10);
    }
  }

  for (let i = 4; i <= endPart; i++) {
    if (i === endPart) {
      target[i] = Math.floor(Math.random() * 9) + 1;
    } else {
      target[i] = Math.floor(Math.random() * 10);
    }
  }

  return target;
}
