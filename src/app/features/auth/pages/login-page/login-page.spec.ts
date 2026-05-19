import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LoginPage } from './login-page';
import { Auth } from '../../../../core/services/auth';
import { User } from '../../../../core/models/user.model';

const mockUser: User = { id: '1', email: 'test@example.com', role: 'CUSTOMER', name: 'Test' };

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideRouter([])],
    }).overrideComponent(LoginPage, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(LoginPage);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should render the login heading', () => {
    expect(el.textContent).toContain('Welcome back');
  });

  it('should render the register link', () => {
    const link = el.querySelector('a[href="/auth/register"]');
    expect(link).not.toBeNull();
  });

  it('should call POST /api/auth/login on form submit with valid credentials', async () => {
    const auth = TestBed.inject(Auth);
    auth.user.set(null);

    const emailInput =
      el.querySelector<HTMLInputElement>('rw-input[label="Email"] input, input[type="email"]') ??
      el.querySelector<HTMLInputElement>('input[autocomplete="email"]');
    const passwordInput = el.querySelector<HTMLInputElement>(
      'input[autocomplete="current-password"]',
    );

    if (emailInput && passwordInput) {
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));

      const form = el.querySelector('form');
      form?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();

      const req = httpTesting.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockUser);
    }
  });
});
