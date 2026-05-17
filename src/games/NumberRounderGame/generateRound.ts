export type RoundingPlace = 'ten' | 'hundred' | 'thousand' | 'ten-thousand';

type RoundConfig = {
  place: RoundingPlace;
  label: string;
  divisor: number;
  minDigits: number;
};

const ROUNDING_OPTIONS: RoundConfig[] = [
  { place: 'ten', label: 'nearest ten', divisor: 10, minDigits: 2 },
  { place: 'hundred', label: 'nearest hundred', divisor: 100, minDigits: 3 },
  { place: 'thousand', label: 'nearest thousand', divisor: 1000, minDigits: 4 },
  { place: 'ten-thousand', label: 'nearest ten thousand', divisor: 10000, minDigits: 5 },
];

function generateNumberWithDigits(numDigits: number): number {
  const min = Math.pow(10, numDigits - 1);
  const max = Math.pow(10, numDigits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export type RoundingPuzzle = {
  number: number;
  place: RoundingPlace;
  label: string;
  divisor: number;
  answer: number;
};

export type RoundingOptions = {
  maxDigits: number;
};

export function generateRoundingPuzzle(options?: RoundingOptions): RoundingPuzzle {
  const maxDigits = options?.maxDigits ?? 6;

  const validOptions = ROUNDING_OPTIONS.filter(o => o.minDigits <= maxDigits);
  if (validOptions.length === 0) {
    return { number: 15, place: 'ten', label: 'nearest ten', divisor: 10, answer: 20 };
  }

  const config = validOptions[Math.floor(Math.random() * validOptions.length)];

  const numDigits = config.minDigits + Math.floor(Math.random() * (maxDigits - config.minDigits + 1));

  for (let attempt = 0; attempt < 100; attempt++) {
    const number = generateNumberWithDigits(numDigits);
    const answer = Math.round(number / config.divisor) * config.divisor;

    if (answer.toString().length !== number.toString().length) continue;

    const lowerBound = Math.floor(number / config.divisor) * config.divisor;
    const distFromLower = number - lowerBound;
    const fractionInRange = distFromLower / config.divisor;
    if (fractionInRange < 0.25 || fractionInRange > 0.75) continue;

    return {
      number,
      place: config.place,
      label: config.label,
      divisor: config.divisor,
      answer,
    };
  }

  // Fallback if no valid number found after attempts
  const fallbackNumber = generateNumberWithDigits(numDigits);
  const fallbackAnswer = Math.round(fallbackNumber / config.divisor) * config.divisor;
  return {
    number: fallbackNumber,
    place: config.place,
    label: config.label,
    divisor: config.divisor,
    answer: fallbackAnswer,
  };
}
