import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Subject } from 'rxjs';
import { PhotonLocationField } from './photon-location-field';
import { PhotonApi, PhotonLocationSuggestion } from '../../../core/services/photon-api';

const mockSuggestions: PhotonLocationSuggestion[] = [
  { label: 'Rome, Italy', city: 'Rome', country: 'Italy' },
  { label: 'Rotherham, United Kingdom', city: 'Rotherham', country: 'United Kingdom' },
];

describe('PhotonLocationField', () => {
  let fixture: ComponentFixture<PhotonLocationField>;
  let el: HTMLElement;
  let searchPlacesFn: ReturnType<typeof vi.fn>;
  let searchSubject: Subject<PhotonLocationSuggestion[]>;

  beforeEach(() => {
    searchSubject = new Subject<PhotonLocationSuggestion[]>();
    searchPlacesFn = vi.fn().mockReturnValue(searchSubject);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        { provide: PhotonApi, useValue: { searchPlaces: searchPlacesFn } },
      ],
    }).overrideComponent(PhotonLocationField, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(PhotonLocationField);
    el = fixture.nativeElement;
    TestBed.flushEffects();
  });

  it('should render the label', () => {
    expect(el.textContent).toContain('Location');
  });

  it('should show combobox input', () => {
    const input = el.querySelector('input[role="combobox"]');
    expect(input).not.toBeNull();
  });

  it('should open suggestions panel when search results arrive', async () => {
    (fixture.componentInstance as any).panelOpen.set(true);
    (fixture.componentInstance as any).suggestions.set(mockSuggestions);
    fixture.detectChanges();

    expect(el.querySelector('.photon-location__suggestions')).not.toBeNull();
  });

  it('should display suggestion labels', async () => {
    (fixture.componentInstance as any).panelOpen.set(true);
    (fixture.componentInstance as any).suggestions.set(mockSuggestions);
    fixture.detectChanges();

    expect(el.textContent).toContain('Rome, Italy');
    expect(el.textContent).toContain('Rotherham, United Kingdom');
  });

  it('should commit value when suggestion is selected', async () => {
    (fixture.componentInstance as any).panelOpen.set(true);
    (fixture.componentInstance as any).suggestions.set(mockSuggestions);
    fixture.detectChanges();

    const firstOption = el.querySelector<HTMLElement>('.photon-location__option')!;
    firstOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toEqual({ city: 'Rome', country: 'Italy' });
  });

  it('should show loading hint while searching', () => {
    (fixture.componentInstance as any).panelOpen.set(true);
    (fixture.componentInstance as any).isLoading.set(true);
    fixture.detectChanges();

    expect(el.textContent).toContain('Searching');
  });

  it('should close panel on Escape key', async () => {
    (fixture.componentInstance as any).panelOpen.set(true);
    (fixture.componentInstance as any).suggestions.set(mockSuggestions);
    fixture.detectChanges();

    const input = el.querySelector<HTMLInputElement>('input')!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(el.querySelector('.photon-location__suggestions')).toBeNull();
  });
});
