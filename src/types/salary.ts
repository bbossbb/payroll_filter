
export interface SalaryData {
  id: string;
  original: number;
  rounded: number;
  breakdown: {
    '1000': number;
    '500': number;
    '100': number;
    '50': number;
    '20': number;
    '10': number;
    '5': number;
  };
}

export type BanknoteBreakdown = {
  '1000': number;
  '500': number;
  '100': number;
  '50': number;
  '20': number;
  '10': number;
  '5': number;
};
