import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { UnauthorizedPage } from './unauthorized-page';

describe('UnauthorizedPage', () => {
  let fixture: ComponentFixture<UnauthorizedPage>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).overrideComponent(UnauthorizedPage, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(UnauthorizedPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render 403 code', () => {
    expect(el.textContent).toContain('403');
  });

  it('should render the title', () => {
    expect(el.textContent).toContain('Access Denied');
  });

  it('should have a link back to home', () => {
    const link = el.querySelector('a[href="/"]');
    expect(link).not.toBeNull();
  });

  it('should have the correct aria label on the section', () => {
    expect(el.querySelector('[aria-labelledby="unauthorized-title"]')).not.toBeNull();
  });
});
