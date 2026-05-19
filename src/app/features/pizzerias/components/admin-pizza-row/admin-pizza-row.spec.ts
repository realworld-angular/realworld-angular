import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Subject } from 'rxjs';
import { AdminPizzaRow } from './admin-pizza-row';
import { Pizza } from '../../models/pizza.models';
import { Dialog } from '@angular/cdk/dialog';

const mockPizza: Pizza = {
  id: 'pizza1',
  name: 'Margherita',
  basePrice: 9.5,
  image: 'marg.jpg',
  createdAt: '2024-01-01',
  toppings: [
    { id: 't1', label: 'Mozzarella', price: 0, sortOrder: 1 },
    { id: 't2', label: 'Tomato', price: 0, sortOrder: 2 },
  ],
};

function createDialogStub() {
  const closed$ = new Subject<any>();
  return { open: vi.fn(() => ({ closed: closed$ })), closed$ };
}

describe('AdminPizzaRow', () => {
  let fixture: ComponentFixture<AdminPizzaRow>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;
  let dialogStub: ReturnType<typeof createDialogStub>;

  beforeEach(() => {
    dialogStub = createDialogStub();
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), { provide: Dialog, useValue: dialogStub }],
    }).overrideComponent(AdminPizzaRow, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(AdminPizzaRow);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('pizza', mockPizza);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should render pizza name and price', () => {
    expect(el.textContent).toContain('Margherita');
    expect(el.textContent).toContain('€9.50');
  });

  it('should show total price including toppings', () => {
    expect(el.textContent).toContain('€9.50');
  });

  it('should show topping labels', () => {
    expect(el.textContent).toContain('Mozzarella');
    expect(el.textContent).toContain('Tomato');
  });

  it('should have edit and delete buttons', () => {
    expect(el.querySelector('[aria-label*="Edit"]')).not.toBeNull();
    expect(el.querySelector('[aria-label*="Delete"]')).not.toBeNull();
  });

  it('should emit edit when edit button clicked', () => {
    const emitted: Pizza[] = [];
    fixture.componentInstance.edit.subscribe((p) => emitted.push(p));
    const editBtn = el.querySelector<HTMLButtonElement>('[aria-label*="Edit"]')!;
    editBtn.click();
    expect(emitted.length).toBe(1);
    expect(emitted[0].id).toBe('pizza1');
  });

  it('should open confirm dialog when delete button clicked (promptDelete)', () => {
    const deleteBtn = el.querySelector<HTMLButtonElement>('[aria-label*="Delete"]')!;
    deleteBtn.click();
    expect(dialogStub.open).toHaveBeenCalled();
  });

  it('should call delete API when confirmed and emit deleted', () => {
    const deleted: Pizza[] = [];
    fixture.componentInstance.deleted.subscribe((p) => deleted.push(p));

    (fixture.componentInstance as any).promptDelete();
    dialogStub.closed$.next('confirmed');

    const req = httpTesting.expectOne('/api/admin/pizzeria/pizzas/pizza1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Deleted' });

    expect(deleted.length).toBe(1);
    expect(deleted[0].id).toBe('pizza1');
  });

  it('should emit deleteError on API failure', () => {
    const errors: string[] = [];
    fixture.componentInstance.deleteError.subscribe((e) => errors.push(e));

    (fixture.componentInstance as any).promptDelete();
    dialogStub.closed$.next('confirmed');

    const req = httpTesting.expectOne('/api/admin/pizzeria/pizzas/pizza1');
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should not call API when dialog is dismissed', () => {
    (fixture.componentInstance as any).promptDelete();
    dialogStub.closed$.next('dismissed');
    httpTesting.expectNone(() => true);
  });
});
