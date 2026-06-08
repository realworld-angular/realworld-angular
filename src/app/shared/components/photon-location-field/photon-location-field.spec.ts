import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PhotonLocationField } from './photon-location-field';

const mockGeoJson = {
  features: [
    {
      properties: {
        name: 'Rome',
        city: 'Rome',
        country: 'Italy',
        type: 'city',
      },
    },
    {
      properties: {
        name: 'Rotherham',
        city: 'Rotherham',
        country: 'United Kingdom',
        type: 'town',
      },
    },
  ],
};

describe('PhotonLocationField', () => {
  let fixture: ComponentFixture<PhotonLocationField>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(PhotonLocationField);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function typeSearch(text: string): void {
    const input = el.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    input.value = text;
    input.dispatchEvent(new Event('input'));
  }

  function flushSearch(): void {
    const req = httpTesting.expectOne((r) => r.url.includes('photon.komoot.io'));
    req.flush(mockGeoJson);
  }

  it('should render the label', () => {
    expect(el.textContent).toContain('Location');
  });

  it('should show combobox input', () => {
    const input = el.querySelector('input[role="combobox"]');
    expect(input).not.toBeNull();
  });

  it('should open suggestions panel when search results arrive', async () => {
    typeSearch('Ro');
    await new Promise((resolve) => setTimeout(resolve, 350));
    flushSearch();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('.photon-location__suggestions')).not.toBeNull();
  });

  it('should display suggestion labels', async () => {
    typeSearch('Ro');
    await new Promise((resolve) => setTimeout(resolve, 350));
    flushSearch();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.textContent).toContain('Rome, Italy');
    expect(el.textContent).toContain('Rotherham, United Kingdom');
  });

  it('should commit value when suggestion is selected', async () => {
    typeSearch('Ro');
    await new Promise((resolve) => setTimeout(resolve, 350));
    flushSearch();
    await fixture.whenStable();
    fixture.detectChanges();

    const firstOption = el.querySelector<HTMLElement>('.photon-location__option')!;
    firstOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toEqual({ city: 'Rome', country: 'Italy' });
  });

  it('should show loading hint while searching', async () => {
    typeSearch('Ro');
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(el.textContent).toContain('Searching');
    httpTesting.expectOne((r) => r.url.includes('photon.komoot.io'));
  });

  it('should close panel on Escape key', async () => {
    typeSearch('Ro');
    await new Promise((resolve) => setTimeout(resolve, 350));
    flushSearch();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('.photon-location__suggestions')).not.toBeNull();

    const input = el.querySelector<HTMLInputElement>('input')!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(el.querySelector('.photon-location__suggestions')).toBeNull();
  });
});
