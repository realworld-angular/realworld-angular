import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdminPizzeriaFormPage } from './admin-pizzeria-form-page';
import { provideRouter, Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({ template: '' })
class StubComponent {}
import { submit } from '@angular/forms/signals';

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
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
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
    (fixture.componentInstance as any).model.set({
      location: { city: 'Rome', country: 'Italy' },
      image: 'roma.jpg',
    });
    await fixture.whenStable();

    const submitPromise = submit((fixture.componentInstance as any).pizzeriaForm);
    const req = httpTesting.expectOne('/api/pizzerias');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ city: 'Rome', country: 'Italy', imageFilename: 'roma.jpg' });
    req.flush({ id: 'p1' });
    await submitPromise;
  });
});
