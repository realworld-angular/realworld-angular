import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProfilePage } from './profile-page';
import { Auth } from '../../../../core/services/auth';
import { User } from '../../../../core/models/user.model';

const mockUser: User = { id: '1', email: 'test@example.com', role: 'CUSTOMER', name: 'Test User' };
const userSignal = signal<User | null>(mockUser);

const authStub = {
  user: userSignal,
  logout: vi.fn(),
};

describe('ProfilePage', () => {
  let fixture: ComponentFixture<ProfilePage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    userSignal.set(mockUser);
    authStub.logout.mockReturnValue({
      pipe: (): { subscribe: (obs: { next?: () => void }) => void } => ({
        subscribe: (obs) => obs.next?.(),
      }),
    });

    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), { provide: Auth, useValue: authStub }],
    }).overrideComponent(ProfilePage, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(ProfilePage);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should display the user name', () => {
    expect(el.textContent).toContain('Test User');
  });

  it('should display the user email', () => {
    expect(el.textContent).toContain('test@example.com');
  });

  it('should show the log out button', () => {
    expect(el.querySelector('rw-button')).not.toBeNull();
  });
});
