import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { Footer } from './footer';
import { Auth } from '../../services/auth';
import { User } from '../../models/user.model';

const userSignal = signal<User | null>(null);
const authStub = { user: userSignal };

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let el: HTMLElement;

  beforeEach(async () => {
    userSignal.set(null);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authStub },
      ],
    }).overrideComponent(Footer, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(Footer);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render copyright text', () => {
    expect(el.textContent).toContain('Realworld Angular');
  });

  it('should render terms and conditions link', () => {
    const link = el.querySelector('a[href="/terms-and-conditions"]');
    expect(link).not.toBeNull();
  });
});
