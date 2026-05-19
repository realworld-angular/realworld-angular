import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { submit } from '@angular/forms/signals';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { AdminPizzaFormDialog } from './admin-pizza-form-dialog';
import { Modal } from '../../../../shared/components/modal/modal';
import { ModalFooter } from '../../../../shared/components/modal/modal-footer';
import { Button } from '../../../../shared/components/button/button';
import { Callout } from '../../../../shared/components/callout/callout';

import { Pizza } from '../../models/pizza.models';

const mockPizza: Pizza = {
  id: 'p1',
  name: 'Margherita',
  basePrice: 9.5,
  image: 'marg.jpg',
  createdAt: '2024-01-01',
  toppings: [{ id: 't1', label: 'Mozzarella', price: 0, sortOrder: 1 }],
};

describe('AdminPizzaFormDialog', () => {
  let fixture: ComponentFixture<AdminPizzaFormDialog>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;
  let closeFn: ReturnType<typeof vi.fn>;

  const componentImports = [DecimalPipe, Modal, ModalFooter, Button, Callout];

  function setupModule(data: Pizza | null) {
    TestBed.resetTestingModule();
    closeFn = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        { provide: DialogRef, useValue: { close: closeFn } },
        { provide: DIALOG_DATA, useValue: data },
      ],
    }).overrideComponent(AdminPizzaFormDialog, {
      set: { imports: componentImports, schemas: [NO_ERRORS_SCHEMA] },
    });
    fixture = TestBed.createComponent(AdminPizzaFormDialog);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
  }

  beforeEach(() => {
    setupModule(null);
  });

  afterEach(() => {
    if (httpTesting) {
      httpTesting.verify();
    }
  });

  it('should show create mode title', () => {
    httpTesting.expectOne('/api/options/toppings').flush([]);
    expect(el.textContent).toContain('New Pizza');
  });

  it('should load toppings on init', () => {
    const req = httpTesting.expectOne('/api/options/toppings');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should submit form and close on save', async () => {
    httpTesting.expectOne('/api/options/toppings').flush([]);
    await fixture.whenStable();
    TestBed.flushEffects();

    (fixture.componentInstance as any).model.update((m: any) => ({ ...m, image: 'test.jpg' }));
    TestBed.flushEffects();

    const submitPromise = submit((fixture.componentInstance as any).pizzaForm);

    const req = httpTesting.expectOne('/api/admin/pizzeria/pizzas');
    expect(req.request.method).toBe('POST');
    req.flush(mockPizza);

    await submitPromise;
    expect(closeFn).toHaveBeenCalled();
  });

  it('should close on dismiss', () => {
    httpTesting.expectOne('/api/options/toppings').flush([]);
    (fixture.componentInstance as any).dismiss();
    expect(closeFn).toHaveBeenCalled();
  });

  it('should compute pizza total price', async () => {
    httpTesting.expectOne('/api/options/toppings').flush([
      { id: 't1', label: 'Mozzarella', price: 0, sortOrder: 1 },
      { id: 't2', label: 'Pepperoni', price: 1.5, sortOrder: 2 },
    ]);
    await fixture.whenStable();
    TestBed.flushEffects();
    const total = (fixture.componentInstance as any).pizzaTotalPrice();
    expect(total).toBe(10);
  });

  it('should show edit mode title when data is provided', () => {
    setupModule(mockPizza);
    httpTesting.expectOne('/api/options/toppings').flush([]);
    expect(el.textContent).toContain('Edit Pizza');
  });
});
