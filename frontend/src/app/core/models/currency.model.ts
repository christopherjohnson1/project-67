/**
 * Currency Model
 * Represents user's coins and stars
 */
export interface Currency {
  coins: number;
  stars: number;
}

export interface CurrencyTransaction {
  type: 'coin' | 'star';
  amount: number;
  reason: string;
  timestamp: Date;
}

