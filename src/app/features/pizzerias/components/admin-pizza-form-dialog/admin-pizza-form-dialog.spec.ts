import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { AdminPizzaFormDialog } from './admin-pizza-form-dialog';
import { FormValueControl, FormField, FormRoot, ValidationError } from '@angular/forms/signals';
import { Pizza } from '../../models/pizza.models';

const mockPizza: Pizza = {
  id: 'p1',
  name: 'Margherita',
  basePrice: 9.5,
  image: 'marg.jpg',
  createdAt: '2024-01-01',
  toppings: [{ id: 't1', label: 'Mozzarella', price: 0, sortOrder: 1 }],
};

@Component({ selector: 'rw-modal', template: '{{ title() }}<ng-content/>', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush })
class MockModal {
  readonly title = input<string>('');
}

@Component({ selector: 'rw-modal-footer', template: '<ng-content/>', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush })
class MockModalFooter {}

@Component({ selector: 'rw-callout', template: '<ng-content/>', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush })
class MockCallout {
  readonly variant = input<string>('');
  readonly message = input<string>('');
}

@Component({
  selector: 'rw-button',
  template: '<button [attr.type]="type()" [disabled]="disabled() || isLoading()"><ng-content/></button>',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockButton {
  readonly type = input<string>('button');
  readonly disabled = input(false);
  readonly isLoading = input(false);
  readonly palette = input<string>('');
  readonly variant = input<string>('');
}

@Component({
  selector: 'rw-input',
  template: '<input [value]="value()" (input)="onInput($event)" [attr.type]="type()"/>',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockInput implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly label = input<string>('');
  onInput(ev: Event): void {
    this.value.set((ev.target as HTMLInputElement).value);
  }
}

@Component({
  selector: 'rw-image-picker',
  template: '',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockImagePicker implements FormValueControl<string | null> {
  readonly value = model<string | null>(null);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly category = input<string>('');
  readonly label = input<string>('');
}

describe('AdminPizzaFormDialog', () => {
  let fixture: ComponentFixture<AdminPizzaFormDialog>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;
  let closeFn: ReturnType<typeof vi.fn>;

  const componentImports = [DecimalPipe, MockModal, MockModalFooter, MockButton, MockCallout, MockInput, MockImagePicker, FormRoot, FormField];

  function setupModule(data: Pizza | null): void {
    TestBed.resetTestingModule();
    closeFn = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        { provide: DialogRef, useValue: { close: closeFn } },
        { provide: DIALOG_DATA, useValue: data },
      ],
    }).overrideComponent(AdminPizzaFormDialog, {
      set: { imports: componentImports },
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

    const imagePickerDe = fixture.debugElement.query(
      (de) => de.componentInstance instanceof MockImagePicker,
    );
    imagePickerDe.componentInstance.value.set('test.jpg');
    TestBed.flushEffects();

    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    const req = httpTesting.expectOne('/api/admin/pizzeria/pizzas');
    expect(req.request.method).toBe('POST');
    req.flush(mockPizza);

    await fixture.whenStable();
    expect(closeFn).toHaveBeenCalled();
  });

  it('should close on dismiss', () => {
    httpTesting.expectOne('/api/options/toppings').flush([]);
    el.querySelector<HTMLButtonElement>('button')!.click();
    expect(closeFn).toHaveBeenCalled();
  });

  it('should compute pizza total price', async () => {
    httpTesting.expectOne('/api/options/toppings').flush([
      { id: 't1', label: 'Mozzarella', price: 0, sortOrder: 1 },
      { id: 't2', label: 'Pepperoni', price: 1.5, sortOrder: 2 },
    ]);
    await fixture.whenStable();
    TestBed.flushEffects();
    const totalEl = el.querySelector('.admin-modal-footer__total-value');
    expect(totalEl?.textContent).toContain('10');
  });

  it('should show edit mode title when data is provided', () => {
    setupModule(mockPizza);
    httpTesting.expectOne('/api/options/toppings').flush([]);
    expect(el.textContent).toContain('Edit Pizza');
  });
});
