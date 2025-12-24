import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Currency {
  coins: number;
  stars: number;
}

/**
 * Currency Service
 * Manages user's coins and stars
 */
@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private currencySubject = new BehaviorSubject<Currency>({
    coins: 0,
    stars: 0,
  });

  public currency$: Observable<Currency> = this.currencySubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  getCurrency(): Currency {
    return this.currencySubject.value;
  }

  addCoins(amount: number): void {
    const current = this.currencySubject.value;
    const updated = {
      ...current,
      coins: Math.max(0, current.coins + amount),
    };
    this.currencySubject.next(updated);
    this.saveToStorage(updated);
  }

  addStars(amount: number): void {
    const current = this.currencySubject.value;
    const updated = {
      ...current,
      stars: Math.max(0, current.stars + amount),
    };
    this.currencySubject.next(updated);
    this.saveToStorage(updated);
  }

  spendCoins(amount: number): boolean {
    const current = this.currencySubject.value;
    if (current.coins >= amount) {
      this.addCoins(-amount);
      return true;
    }
    return false;
  }

  setCurrency(currency: Currency): void {
    this.currencySubject.next(currency);
    this.saveToStorage(currency);
  }

  reset(): void {
    const initial = { coins: 0, stars: 0 };
    this.currencySubject.next(initial);
    this.saveToStorage(initial);
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('treasure_hunt_currency');
    if (stored) {
      try {
        const currency = JSON.parse(stored);
        this.currencySubject.next(currency);
      } catch (error) {
        console.error('Failed to load currency from storage:', error);
      }
    }
  }

  private saveToStorage(currency: Currency): void {
    try {
      localStorage.setItem('treasure_hunt_currency', JSON.stringify(currency));
    } catch (error) {
      console.error('Failed to save currency to storage:', error);
    }
  }
}

