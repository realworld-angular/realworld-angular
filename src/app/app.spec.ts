import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { Auth } from './core/services/auth';
import { CartStore } from './features/cart/cart.store';
import { signal } from '@angular/core';
import { Observable, of } from 'rxjs';

describe('App', () => {
  const mockAuthService = {
    isAuthenticated: signal(false),
    user: signal(null),
    isCustomer: signal(false),
    isAdmin: signal(false),
    init: (): Observable<null> => of(null),
    logout: (): Observable<null> => of(null),
  };

  const mockCartService = {
    itemCount: signal(0),
    isEmpty: signal(true),
    items: signal([]),
    total: signal(0),
    pizzeria: signal(null),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: mockAuthService },
        { provide: CartStore, useValue: mockCartService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the header', () => {
    const fixture = TestBed.createComponent(App);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('rw-header')).toBeTruthy();
  });
});
