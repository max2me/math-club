const strategies = [
  () => Math.floor(Math.random() * 900 + 100) * 1000 + Math.floor(Math.random() * 1000),
  () => Math.floor(Math.random() * 90 + 10) * 1000 + Math.floor(Math.random() * 1000),
  () => Math.floor(Math.random() * 9 + 1) * 1000 + Math.floor(Math.random() * 1000),
  () => Math.floor(Math.random() * 900 + 100),
];

export function generatePair(): [number, number] {
  const strategyIdx = Math.floor(Math.random() * strategies.length);

  let n1: number;
  let n2: number;

  // 70% of the time, use the same strategy for both (same digit count)
  if (Math.random() < 0.7) {
    n1 = strategies[strategyIdx]();
    n2 = strategies[strategyIdx]();
  } else {
    n1 = strategies[strategyIdx]();
    n2 = strategies[Math.floor(Math.random() * strategies.length)]();
  }

  if (Math.random() < 0.05) {
    n2 = n1;
  } else if (Math.random() < 0.3) {
    const diffStr = n1.toString().split('');
    const changeIdx = Math.floor(Math.random() * diffStr.length);
    diffStr[changeIdx] = String((parseInt(diffStr[changeIdx]) + 1) % 10);
    n2 = parseInt(diffStr.join(''));
  }

  return [n1, n2];
}
