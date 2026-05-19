import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { Spinner } from './spinner';

describe('Spinner', () => {
  let fixture: ComponentFixture<Spinner>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(Spinner, {
      set: { schemas: [NO_ERRORS_SCHEMA] },
    });
    fixture = TestBed.createComponent(Spinner);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the animated pizza logo', () => {
    expect(el.querySelector('rw-pizza-logo')).not.toBeNull();
  });

  it('should have a status role', () => {
    expect(el.querySelector('[role="status"]')).not.toBeNull();
  });

  it('should have sr-only loading text', () => {
    const srOnly = el.querySelector('.sr-only');
    expect(srOnly).not.toBeNull();
    expect(srOnly!.textContent).toContain('Loading');
  });
});
