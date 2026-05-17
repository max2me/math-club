export type RoundingPlace = 'ten' | 'hundred' | 'thousand' | 'ten-thousand';

type RoundConfig = {
  place: RoundingPlace;
  label: string;
  divisor: number;
};

const ROUNDING_OPTIONS: RoundConfig[] = [
  { place: 'ten', label: 'nearest ten', divisor: 10 },
  { place: 'hundred', label: 'nearest hundred', divisor: 100 },
  { place: 'thousand', label: 'nearest thousand', divisor: 1000 },
  { place: 'ten-thousand', label: 'nearest ten thousand', divisor: 10000 },
];

function generateNumberForPlace(place: RoundingPlace): number {
  switch (place) {
    case 'ten':
      return Math.floor(Math.random() * 900) + 100; // 100-999
    case 'hundred':
      return Math.floor(Math.random() * 9000) + 1000; // 1,000-9,999
    case 'thousand':
      return Math.floor(Math.random() * 90000) + 10000; // 10,000-99,999
    case 'ten-thousand':
      return Math.floor(Math.random() * 900000) + 100000; // 100,000-999,999
  }
}

export type RoundingPuzzle = {
  number: number;
  place: RoundingPlace;
  label: string;
  divisor: number;
  answer: number;
};

export function generateRoundingPuzzle(): RoundingPuzzle {
  const config = ROUNDING_OPTIONS[Math.floor(Math.random() * ROUNDING_OPTIONS.length)];
  const number = generateNumberForPlace(config.place);
  const answer = Math.round(number / config.divisor) * config.divisor;

  return {
    number,
    place: config.place,
    label: config.label,
    divisor: config.divisor,
    answer,
  };
}
