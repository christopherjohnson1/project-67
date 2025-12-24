import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../models/user.model';

/**
 * Authentication service
 * Handles user authentication, login, registration, and token management
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'treasure_hunt_token';
  private readonly REFRESH_TOKEN_KEY = 'treasure_hunt_refresh_token';
  private readonly USER_KEY = 'treasure_hunt_user';
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  /**
   * Get current user observable
   */
  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  /**
   * Get current user value
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Test method to verify service is working
   */
  test(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
        this.setUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.isRefreshing = true;

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
        this.setUser(response.user);
        this.currentUserSubject.next(response.user);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response.accessToken);
      })
    );
  }

  /**
   * Check if token refresh is in progress
   */
  get isRefreshingToken(): boolean {
    return this.isRefreshing;
  }

  /**
   * Get refresh token subject for waiting on refresh
   */
  get refreshTokenSubject$() {
    return this.refreshTokenSubject.asObservable();
  }

  /**
   * Register new user
   */
  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this.setUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.clearToken();
    this.clearRefreshToken();
    this.clearUser();
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired (basic check)
    try {
      const payload = this.decodeToken(token);
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored user
   */
  getUser(): User | null {
    return this.getUserFromStorage();
  }

  /**
   * Store JWT token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Store refresh token
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Store user data
   */
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear stored token
   */
  private clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Clear stored refresh token
   */
  private clearRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Clear stored user
   */
  private clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get user from local storage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) {
      return null;
    }
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token');
      }
      
      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Failed to decode token');
    }
  }
}

