import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  let fixture: ComponentFixture<EmptyState>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(EmptyState, {
      set: { schemas: [NO_ERRORS_SCHEMA] },
    });
    fixture = TestBed.createComponent(EmptyState);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the title', async () => {
    fixture.componentRef.setInput('title', 'No items');
    await fixture.whenStable();
    expect(el.textContent).toContain('No items');
  });

  it('should render the text', async () => {
    fixture.componentRef.setInput('text', 'There are no items to show.');
    await fixture.whenStable();
    expect(el.textContent).toContain('There are no items to show.');
  });

  it('should render the icon image', async () => {
    fixture.componentRef.setInput('icon', 'empty-cart');
    await fixture.whenStable();
    const img = el.querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('src')).toContain('empty-cart.svg');
  });

  it('should have a status role', () => {
    expect(el.querySelector('[role="status"]')).not.toBeNull();
  });

  it('should not show icon when not provided', () => {
    expect(el.querySelector('img')).toBeNull();
  });

  it('should not show title when not provided', () => {
    expect(el.querySelector('h2')).toBeNull();
  });
});
