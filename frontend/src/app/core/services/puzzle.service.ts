import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Puzzle, PuzzleAttempt, PuzzleAttemptResult } from '../models/puzzle.model';

/**
 * Puzzle service
 * Handles puzzle retrieval, submission, and progress tracking
 * TODO: Implement full puzzle system in next phase
 */
@Injectable({
  providedIn: 'root'
})
export class PuzzleService {
  private readonly apiUrl = `${environment.apiUrl}/puzzles`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Test method to verify service is working
   */
  test(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }

  /**
   * Get current unlocked puzzle
   * TODO: Implement in next phase
   */
  getCurrentPuzzle(): Observable<Puzzle> {
    // TODO: Implement
    throw new Error('Not implemented yet');
  }

  /**
   * Submit puzzle attempt
   * TODO: Implement in next phase
   */
  submitAttempt(attempt: PuzzleAttempt): Observable<PuzzleAttemptResult> {
    // TODO: Implement
    throw new Error('Not implemented yet');
  }
}

