import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { PizzeriaDetail } from '../../models/pizzeria.models';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Subject } from 'rxjs';
import { AdminPizzeriaConfigurationPage } from './admin-pizzeria-configuration-page';
import { Dialog } from '@angular/cdk/dialog';
import { provideRouter } from '@angular/router';
import { FormValueControl, FormField, FormRoot, ValidationError } from '@angular/forms/signals';
import { LocationValue } from '../../../../shared/components/photon-location-field/photon-location-field';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Button } from '../../../../shared/components/button/button';
import { Callout } from '../../../../shared/components/callout/callout';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class StubComponent {}

const mockPizzeria: PizzeriaDetail = {
  id: 'p1',
  name: 'Roma',
  city: 'Rome',
  country: 'Italy',
  image: 'roma.jpg',
  owner: { id: 'o1', name: 'Owner' },
  _count: { pizzas: 3 },
  createdAt: '2024-01-01',
  staff: [],
};

function createDialogStub(): { open: ReturnType<typeof vi.fn>; closed$: Subject<string | null> } {
  const closed$ = new Subject<string | null>();
  return { open: vi.fn(() => ({ closed: closed$ })), closed$ };
}

@Component({
  selector: 'rw-image-picker',
  template: '',
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

@Component({
  selector: 'rw-photon-location-field',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockPhotonLocationField implements FormValueControl<LocationValue | null> {
  readonly value = model<LocationValue | null>(null);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
}

describe('AdminPizzeriaConfigurationPage', () => {
  let fixture: ComponentFixture<AdminPizzeriaConfigurationPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;
  let dialogStub: ReturnType<typeof createDialogStub>;

  beforeEach(() => {
    dialogStub = createDialogStub();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: StubComponent }]),
        { provide: Dialog, useValue: dialogStub },
      ],
    }).overrideComponent(AdminPizzeriaConfigurationPage, {
      set: {
        imports: [
          Spinner,
          Callout,
          Button,
          MockImagePicker,
          MockPhotonLocationField,
          FormRoot,
          FormField,
        ],
      },
    });
    fixture = TestBed.createComponent(AdminPizzeriaConfigurationPage);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should show loading indicator before response', () => {
    const req = httpTesting.expectOne('/api/pizzerias/admin/pizzeria');
    expect(el.querySelector('[aria-label="Loading pizzeria settings"]')).not.toBeNull();
    req.flush(mockPizzeria);
  });

  it('should render the pizzeria name after loading', async () => {
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush(mockPizzeria);
    await fixture.whenStable();
    TestBed.flushEffects();
    const nameInput = el.querySelector<HTMLInputElement>('#pizzeria-name')!;
    expect(nameInput.value).toBe('Roma');
  });

  it('should show error callout on HTTP failure', async () => {
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush('error', {
      status: 500,
      statusText: 'Server Error',
    });
    await fixture.whenStable();
    expect(el.querySelector('rw-callout')).not.toBeNull();
  });

  it('should pre-fill form fields from loaded pizzeria', async () => {
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush(mockPizzeria);
    await fixture.whenStable();
    TestBed.flushEffects();

    const locationDe = fixture.debugElement.query(
      (de) => de.componentInstance instanceof MockPhotonLocationField,
    );
    expect(locationDe.componentInstance.value()).toEqual({ city: 'Rome', country: 'Italy' });

    const imageDe = fixture.debugElement.query(
      (de) => de.componentInstance instanceof MockImagePicker,
    );
    expect(imageDe.componentInstance.value()).toBe('roma.jpg');
  });

  it('should open confirm dialog on delete click and call DELETE on confirm', async () => {
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush(mockPizzeria);
    await fixture.whenStable();
    TestBed.flushEffects();

    el.querySelector<HTMLButtonElement>('.danger-zone button')!.click();
    expect(dialogStub.open).toHaveBeenCalled();

    dialogStub.closed$.next('confirmed');
    const req = httpTesting.expectOne('/api/pizzerias/admin/pizzeria');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Deleted' });
  });

  it('should show success callout after saving', async () => {
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush(mockPizzeria);
    await fixture.whenStable();
    TestBed.flushEffects();

    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
    const putReq = httpTesting.expectOne(
      (r) => r.url.includes('/api/pizzerias/admin/pizzeria') && r.method === 'PATCH',
    );
    expect(putReq.request.method).toBe('PATCH');
    putReq.flush({ message: 'Updated' });
    await fixture.whenStable();
    TestBed.flushEffects();

    expect(el.querySelector('rw-callout')).not.toBeNull();
  });
});
