import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);

  public readonly user = signal<User | null>(null);
  public readonly isAuthenticated = computed<boolean>(() => this.user() !== null);
  public readonly isCustomer = computed<boolean>(() => this.user()?.role === 'CUSTOMER');
  public readonly isAdmin = computed<boolean>(() => this.user()?.role === 'PIZZERIA_ADMIN');

  /** Called once on app init to restore session */
  public init(): Observable<User | null> {
    return this.http.get<User>('/api/auth/me').pipe(
      tap((user) => {
        this.user.set(user);
      }),
      catchError(() => {
        this.user.set(null);
        return of(null);
      }),
    );
  }

  public register(email: string, password: string): Observable<User> {
    return this.http
      .post<User>('/api/auth/register', { email, password })
      .pipe(tap((user) => this.user.set(user)));
  }

  public registerPizzeriaOwner(email: string, password: string): Observable<User> {
    return this.http
      .post<User>('/api/auth/register-pizzeria-owner', { email, password })
      .pipe(tap((user) => this.user.set(user)));
  }

  public login(email: string, password: string): Observable<User> {
    return this.http
      .post<User>('/api/auth/login', { email, password })
      .pipe(tap((user) => this.user.set(user)));
  }

  public logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {});
  }
}
