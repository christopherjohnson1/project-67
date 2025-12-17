import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginCredentials, RegisterData } from '../models/user.model';

/**
 * Authentication service
 * Handles user authentication, login, registration, and token management
 * TODO: Implement full authentication in next phase
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Test method to verify service is working
   */
  test(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }

  /**
   * Login with username and password
   * TODO: Implement in next phase
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // TODO: Implement
    throw new Error('Not implemented yet');
  }

  /**
   * Register new user
   * TODO: Implement in next phase
   */
  register(data: RegisterData): Observable<AuthResponse> {
    // TODO: Implement
    throw new Error('Not implemented yet');
  }

  /**
   * Logout current user
   * TODO: Implement in next phase
   */
  logout(): Observable<void> {
    // TODO: Implement
    throw new Error('Not implemented yet');
  }
}

