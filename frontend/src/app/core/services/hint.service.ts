import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Hint, HintRequestResult } from '../models/progress.model';

/**
 * Hint service
 * Handles hint retrieval and request tracking
 * TODO: Implement full hint system in next phase
 */
@Injectable({
  providedIn: 'root'
})
export class HintService {
  private readonly apiUrl = `${environment.apiUrl}/puzzles`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get available hints for a puzzle
   * TODO: Implement in next phase
   */
  getHints(puzzleId: number): Observable<Hint[]> {
    // TODO: Implement
    throw new Error('Not implemented yet');
  }

  /**
   * Request a hint
   * TODO: Implement in next phase
   */
  requestHint(puzzleId: number, hintId: number): Observable<HintRequestResult> {
    // TODO: Implement
    throw new Error('Not implemented yet');
  }
}

