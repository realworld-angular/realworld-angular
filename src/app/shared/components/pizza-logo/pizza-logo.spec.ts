import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { PizzaLogo } from './pizza-logo';

describe('PizzaLogo', () => {
  let fixture: ComponentFixture<PizzaLogo>;
  let el: HTMLElement;
  let svg: SVGElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(PizzaLogo, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(PizzaLogo);
    el = fixture.nativeElement;
    svg = el.querySelector('svg')!;
    await fixture.whenStable();
  });

  it('should render an SVG element', () => {
    expect(svg).not.toBeNull();
  });

  it('should set width and height from size input', async () => {
    fixture.componentRef.setInput('size', 48);
    await fixture.whenStable();
    expect(svg.getAttribute('width')).toBe('48');
    expect(svg.getAttribute('height')).toBe('48');
  });

  it('should be aria-hidden when no label', () => {
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('should have role img and aria-label when label is set', async () => {
    fixture.componentRef.setInput('label', 'Pizza logo');
    await fixture.whenStable();
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Pizza logo');
    expect(svg.getAttribute('aria-hidden')).toBeNull();
  });

  it('should apply animated host class when animated is true', async () => {
    fixture.componentRef.setInput('animated', true);
    await fixture.whenStable();
    expect(el.classList.contains('is-animated')).toBe(true);
  });

  it('should render 6 slice paths', () => {
    const paths = svg.querySelectorAll('path');
    expect(paths.length).toBe(6);
  });
});
