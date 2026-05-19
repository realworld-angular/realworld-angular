import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { Header } from './header';
import { Auth } from '../../services/auth';
import { CartStore } from '../../../features/cart/cart.store';
import { User } from '../../models/user.model';

const userSignal = signal<User | null>(null);
const authStub = {
  user: userSignal,
  isAuthenticated: (): boolean => userSignal() !== null,
  isAdmin: (): boolean => userSignal()?.role === 'PIZZERIA_ADMIN',
  isCustomer: (): boolean => userSignal()?.role === 'CUSTOMER',
};

const itemCountSignal = signal(0);
const cartStoreStub = {
  itemCount: itemCountSignal,
  cart: signal(null),
};

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let el: HTMLElement;

  beforeEach(async () => {
    userSignal.set(null);
    itemCountSignal.set(0);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authStub },
        { provide: CartStore, useValue: cartStoreStub },
      ],
    }).overrideComponent(Header, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(Header);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the logo text', () => {
    expect(el.textContent).toContain('Sliced');
  });

  it('should show hamburger button', () => {
    expect(el.querySelector('[aria-label="Toggle mobile menu"]')).not.toBeNull();
  });

  it('should open mobile menu when hamburger is clicked', async () => {
    const hamburger = el.querySelector<HTMLButtonElement>('[aria-label="Toggle mobile menu"]')!;
    hamburger.click();
    await fixture.whenStable();
    expect(el.querySelector('#mobile-menu')).not.toBeNull();
  });

  it('should close mobile menu when backdrop is clicked', async () => {
    const hamburger = el.querySelector<HTMLButtonElement>('[aria-label="Toggle mobile menu"]')!;
    hamburger.click();
    await fixture.whenStable();
    const backdrop = el.querySelector<HTMLButtonElement>('.mobile-menu-backdrop')!;
    backdrop.click();
    await fixture.whenStable();
    expect(el.querySelector('#mobile-menu')).toBeNull();
  });

  it('should show cart link when user is not admin', () => {
    expect(el.querySelector('.cart-link')).not.toBeNull();
  });

  it('should show cart badge when itemCount > 0', async () => {
    itemCountSignal.set(3);
    await fixture.whenStable();
    expect(el.querySelector('.cart-link__badge')).not.toBeNull();
    expect(el.querySelector('.cart-link__badge')!.textContent).toContain('3');
  });

  it('should hide cart link when user is admin', async () => {
    userSignal.set({ id: '1', email: 'a@b.com', role: 'PIZZERIA_ADMIN', name: 'Admin' });
    await fixture.whenStable();
    expect(el.querySelector('.cart-link')).toBeNull();
  });

  it('should show Pizzerias nav link when user is not admin', () => {
    expect(el.querySelector('a[href="/"]')).not.toBeNull();
  });
});
