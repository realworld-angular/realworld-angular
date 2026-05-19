import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { Pagination } from './pagination';

describe('Pagination', () => {
  let fixture: ComponentFixture<Pagination>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(Pagination, {
      set: { schemas: [NO_ERRORS_SCHEMA] },
    });
    fixture = TestBed.createComponent(Pagination);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('totalPages', 1);
    await fixture.whenStable();
  });

  it('should not render when totalPages is 1', () => {
    expect(el.querySelector('nav')).toBeNull();
  });

  it('should render navigation when totalPages > 1', async () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    await fixture.whenStable();
    expect(el.querySelector('nav[aria-label="Pagination"]')).not.toBeNull();
  });

  it('should render page number buttons', async () => {
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 2);
    await fixture.whenStable();
    const buttons = el.querySelectorAll('.pagination__btn:not(.pagination__btn--icon)');
    expect(buttons.length).toBe(3);
    expect(buttons[0].textContent).toContain('1');
    expect(buttons[1].textContent).toContain('2');
    expect(buttons[2].textContent).toContain('3');
  });

  it('should highlight current page', async () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 4);
    await fixture.whenStable();
    const activeBtn = el.querySelector('.pagination__btn--active');
    expect(activeBtn).not.toBeNull();
    expect(activeBtn?.textContent).toContain('4');
  });

  it('should disable prev button on first page', async () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 1);
    await fixture.whenStable();
    const prevBtn = el.querySelector('[aria-label="Previous page"]') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
  });

  it('should disable next button on last page', async () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 5);
    await fixture.whenStable();
    const nextBtn = el.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
  });

  it('should emit pageChange on page click', async () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 1);
    await fixture.whenStable();
    const emitted: number[] = [];
    fixture.componentRef.instance.pageChange.subscribe((p) => emitted.push(p));

    const page2 = el.querySelector('[aria-label="Page 2"]') as HTMLButtonElement;
    page2.click();
    expect(emitted).toContain(2);
  });

  it('should emit pageChange - 1 on prev click', async () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    await fixture.whenStable();
    const emitted: number[] = [];
    fixture.componentRef.instance.pageChange.subscribe((p) => emitted.push(p));

    const prevBtn = el.querySelector('[aria-label="Previous page"]') as HTMLButtonElement;
    prevBtn.click();
    expect(emitted).toContain(2);
  });

  it('should emit pageChange + 1 on next click', async () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    await fixture.whenStable();
    const emitted: number[] = [];
    fixture.componentRef.instance.pageChange.subscribe((p) => emitted.push(p));

    const nextBtn = el.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
    nextBtn.click();
    expect(emitted).toContain(4);
  });
});
