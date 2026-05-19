import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { RoleDirective } from './role.directive';
import { Auth } from '../../core/services/auth';
import { User } from '../../core/models/user.model';

const userSignal = signal<User | null>(null);

const authStub = {
  user: userSignal,
};

@Component({
  imports: [RoleDirective],
  template: `
    <span *rwRole="'GUEST'" id="guest-content">Guest only</span>
    <span *rwRole="'CUSTOMER'" id="customer-content">Customer only</span>
    <span *rwRole="'PIZZERIA_ADMIN'" id="admin-content">Admin only</span>
    <span *rwRole="['CUSTOMER', 'PIZZERIA_ADMIN']" id="auth-content">Authenticated</span>
    <span *rwRole="'CUSTOMER'; else guestTpl" id="customer-or-else">Customer</span>
    <ng-template #guestTpl><span id="else-content">Please sign in</span></ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {}

describe('RoleDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: Auth, useValue: authStub }],
    });
    userSignal.set(null);
    fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  it('should show GUEST content when user is null', () => {
    expect(el.querySelector('#guest-content')).not.toBeNull();
  });

  it('should hide GUEST content when user is authenticated', async () => {
    userSignal.set({ id: '1', email: 'a@b.com', role: 'CUSTOMER', name: 'Test' });
    await fixture.whenStable();
    expect(el.querySelector('#guest-content')).toBeNull();
  });

  it('should show CUSTOMER content when role matches', async () => {
    userSignal.set({ id: '1', email: 'a@b.com', role: 'CUSTOMER', name: 'Test' });
    await fixture.whenStable();
    expect(el.querySelector('#customer-content')).not.toBeNull();
  });

  it('should hide CUSTOMER content when role does not match', () => {
    expect(el.querySelector('#customer-content')).toBeNull();
  });

  it('should show PIZZERIA_ADMIN content for admin user', async () => {
    userSignal.set({ id: '2', email: 'admin@b.com', role: 'PIZZERIA_ADMIN', name: 'Admin' });
    await fixture.whenStable();
    expect(el.querySelector('#admin-content')).not.toBeNull();
  });

  it('should hide PIZZERIA_ADMIN content for non-admin user', async () => {
    userSignal.set({ id: '1', email: 'a@b.com', role: 'CUSTOMER', name: 'Test' });
    await fixture.whenStable();
    expect(el.querySelector('#admin-content')).toBeNull();
  });

  it('should show auth-content for any authenticated role', async () => {
    userSignal.set({ id: '1', email: 'a@b.com', role: 'CUSTOMER', name: 'Test' });
    await fixture.whenStable();
    expect(el.querySelector('#auth-content')).not.toBeNull();

    userSignal.set({ id: '2', email: 'admin@b.com', role: 'PIZZERIA_ADMIN', name: 'Admin' });
    await fixture.whenStable();
    expect(el.querySelector('#auth-content')).not.toBeNull();
  });

  it('should hide auth-content when not authenticated', () => {
    expect(el.querySelector('#auth-content')).toBeNull();
  });

  it('should show else template when CUSTOMER condition is false', () => {
    expect(el.querySelector('#else-content')).not.toBeNull();
    expect(el.querySelector('#customer-or-else')).toBeNull();
  });

  it('should swap to main template and hide else when CUSTOMER condition becomes true', async () => {
    userSignal.set({ id: '1', email: 'a@b.com', role: 'CUSTOMER', name: 'Test' });
    await fixture.whenStable();
    expect(el.querySelector('#customer-or-else')).not.toBeNull();
    expect(el.querySelector('#else-content')).toBeNull();
  });

  it('should react to user signal changes', async () => {
    expect(el.querySelector('#customer-content')).toBeNull();

    userSignal.set({ id: '1', email: 'a@b.com', role: 'CUSTOMER', name: 'Test' });
    await fixture.whenStable();
    expect(el.querySelector('#customer-content')).not.toBeNull();

    userSignal.set(null);
    await fixture.whenStable();
    expect(el.querySelector('#customer-content')).toBeNull();
  });
});
