export type PlacedItem = {
  id: string;
  value: number;
  row: number;
  col: number;
  colorClass?: string;
};

export type CompareOp = '<' | '>' | '=';
