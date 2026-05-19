import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Subject } from 'rxjs';
import { AdminPizzeriaConfigurationPage } from './admin-pizzeria-configuration-page';
import { Dialog } from '@angular/cdk/dialog';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';

@Component({ template: '' })
class StubComponent {}
import { PizzeriaDetail } from '../../models/pizzeria.models';

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

function createDialogStub() {
  const closed$ = new Subject<any>();
  return { open: vi.fn(() => ({ closed: closed$ })), closed$ };
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
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
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
      status: 500, statusText: 'Server Error',
    });
    await fixture.whenStable();
    expect(el.querySelector('rw-callout')).not.toBeNull();
  });

  it('should pre-fill form fields from loaded pizzeria', async () => {
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush(mockPizzeria);
    await fixture.whenStable();
    TestBed.flushEffects();
    const model = (fixture.componentInstance as any).model();
    expect(model.location).toEqual({ city: 'Rome', country: 'Italy' });
    expect(model.image).toBe('roma.jpg');
  });

  it('should open confirm dialog on delete click and call DELETE on confirm', async () => {
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush(mockPizzeria);
    await fixture.whenStable();
    TestBed.flushEffects();

    (fixture.componentInstance as any).deletePizzeria();
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

    (fixture.componentInstance as any).submitSuccess.set(true);
    fixture.detectChanges();
    expect(el.querySelector('rw-callout')).not.toBeNull();
  });
});
