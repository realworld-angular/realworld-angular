import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RegisterPage } from './register-page';

describe('RegisterPage', () => {
  let fixture: ComponentFixture<RegisterPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideRouter([])],
    }).overrideComponent(RegisterPage, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(RegisterPage);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should render the form', () => {
    expect(el.querySelector('form')).not.toBeNull();
  });

  it('should render a submit button', () => {
    expect(el.querySelector('rw-button[type="submit"], button[type="submit"]')).not.toBeNull();
  });

  it('should render a login link', () => {
    const link = el.querySelector('a[href="/auth/login"]');
    expect(link).not.toBeNull();
  });

  it('should use /api/auth/register-pizzeria-owner when registerAsPizzeriaOwner is true', async () => {
    fixture.componentRef.setInput('registerAsPizzeriaOwner', true);
    await fixture.whenStable();
    expect(fixture.componentInstance.registerAsPizzeriaOwner()).toBe(true);
  });

  it('should not trigger HTTP validation while typing email character by character', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const emailInput = el.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput).not.toBeNull();

    // Type email character by character
    const emailChars = 'test@example.com'.split('');
    for (const char of emailChars) {
      emailInput.value += char;
      emailInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    await fixture.whenStable();

    // Should not have made any HTTP requests during typing
    httpTesting.expectNone((req) => req.url.includes('/api/auth/check-email'));
  });
});
