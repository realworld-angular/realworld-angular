import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  let fixture: ComponentFixture<NotFoundPage>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).overrideComponent(NotFoundPage, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(NotFoundPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render 404 code', () => {
    expect(el.textContent).toContain('404');
  });

  it('should render the title', () => {
    expect(el.textContent).toContain('Page Not Found');
  });

  it('should have a link back to home', () => {
    const link = el.querySelector('a[href="/"]');
    expect(link).not.toBeNull();
  });
});
