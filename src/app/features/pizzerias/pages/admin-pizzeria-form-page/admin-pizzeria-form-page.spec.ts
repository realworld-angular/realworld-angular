import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdminPizzeriaFormPage } from './admin-pizzeria-form-page';
import { provideRouter } from '@angular/router';
import { FormValueControl, FormField, FormRoot, ValidationError } from '@angular/forms/signals';
import { LocationValue } from '../../../../shared/components/photon-location-field/photon-location-field';
import { Button } from '../../../../shared/components/button/button';
import { Callout } from '../../../../shared/components/callout/callout';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class StubComponent {}

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

@Component({
  selector: 'rw-photon-location-field',
  template: '',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockPhotonLocationField implements FormValueControl<LocationValue | null> {
  readonly value = model<LocationValue | null>(null);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
}

describe('AdminPizzeriaFormPage', () => {
  let fixture: ComponentFixture<AdminPizzeriaFormPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: StubComponent }]),
      ],
    }).overrideComponent(AdminPizzeriaFormPage, {
      set: {
        imports: [
          Button,
          Callout,
          MockImagePicker,
          MockPhotonLocationField,
          FormRoot,
          FormField,
        ],
      },
    });
    fixture = TestBed.createComponent(AdminPizzeriaFormPage);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should render the form title', () => {
    expect(el.textContent).toContain('New Pizzeria');
  });

  it('should call POST /api/pizzerias on successful form submission', async () => {
    const locationDe = fixture.debugElement.query(
      (de) => de.componentInstance instanceof MockPhotonLocationField,
    );
    locationDe.componentInstance.value.set({ city: 'Rome', country: 'Italy' });

    const imageDe = fixture.debugElement.query(
      (de) => de.componentInstance instanceof MockImagePicker,
    );
    imageDe.componentInstance.value.set('roma.jpg');

    TestBed.flushEffects();
    await fixture.whenStable();

    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    const req = httpTesting.expectOne('/api/pizzerias');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ city: 'Rome', country: 'Italy', imageFilename: 'roma.jpg' });
    req.flush({ id: 'p1' });
  });
});
