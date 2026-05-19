import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ImagePicker } from './image-picker';

describe('ImagePicker', () => {
  let fixture: ComponentFixture<ImagePicker>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    }).overrideComponent(ImagePicker, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(ImagePicker);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('category', 'pizzeria');
    fixture.componentRef.setInput('label', 'Pizzeria image');
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should show loading indicator before filenames response', () => {
    const req = httpTesting.expectOne('/api/pizzerias/images');
    expect(el.textContent).toContain('Loading images');
    req.flush([]);
  });

  it('should render image grid after successful response', async () => {
    httpTesting.expectOne('/api/pizzerias/images').flush(['img1.jpg', 'img2.jpg']);
    await fixture.whenStable();
    expect(el.querySelector('[role="radiogroup"]')).not.toBeNull();
  });

  it('should show empty message when no images available', async () => {
    httpTesting.expectOne('/api/pizzerias/images').flush([]);
    await fixture.whenStable();
    expect(el.textContent).toContain('No bundled images');
  });

  it('should show error message on HTTP failure', async () => {
    httpTesting.expectOne('/api/pizzerias/images').flush('error', {
      status: 500, statusText: 'Server Error',
    });
    await fixture.whenStable();
    expect(el.textContent).toContain('Could not load image list');
  });

  it('should select an image on click', async () => {
    httpTesting.expectOne('/api/pizzerias/images').flush(['img1.jpg', 'img2.jpg']);
    await fixture.whenStable();
    const buttons = el.querySelectorAll<HTMLButtonElement>('[role="radiogroup"] button');
    expect(buttons.length).toBe(2);
    buttons[0].click();
    expect(fixture.componentInstance.value()).toBe('img1.jpg');
  });

  it('should mark selected image', async () => {
    httpTesting.expectOne('/api/pizzerias/images').flush(['img1.jpg', 'img2.jpg']);
    await fixture.whenStable();
    fixture.componentRef.setInput('value', 'img2.jpg');
    await fixture.whenStable();
    const selectedBtn = el.querySelector('[aria-pressed="true"]');
    expect(selectedBtn?.getAttribute('aria-label')).toContain('img2.jpg');
  });

  it('should show validation error when invalid and touched', async () => {
    httpTesting.expectOne('/api/pizzerias/images').flush(['img1.jpg']);
    await fixture.whenStable();
    fixture.componentRef.setInput('invalid', true);
    fixture.componentInstance.touched.set(true);
    await fixture.whenStable();
    expect(el.querySelector('.picker--invalid')).not.toBeNull();
  });
});
