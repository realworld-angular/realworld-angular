import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { LoadMore } from './load-more';

function stubViewportNearBottom(): void {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 1000,
    configurable: true,
  });
  Object.defineProperty(window, 'scrollY', { value: 700, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 400, configurable: true });
}

function stubViewportNotNearBottom(): void {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 2000,
    configurable: true,
  });
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 400, configurable: true });
}

describe('LoadMore', () => {
  let fixture: ComponentFixture<LoadMore>;
  let emitCount: number;

  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        public observe(): void {
          return;
        }
        public disconnect(): void {
          return;
        }
        public unobserve(): void {
          return;
        }
      },
    );
  });

  beforeEach(async () => {
    stubViewportNotNearBottom();

    emitCount = 0;
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(LoadMore);
    fixture.componentInstance.loadMore.subscribe(() => {
      emitCount += 1;
    });
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render a sentinel element', () => {
    expect(fixture.nativeElement.querySelector('.load-more')).not.toBeNull();
  });

  it('should emit loadMore when scrolled near the bottom', async () => {
    stubViewportNearBottom();
    await fixture.whenStable();
    const countBeforeScroll = emitCount;
    window.dispatchEvent(new Event('scroll'));
    expect(emitCount).toBe(countBeforeScroll + 1);
  });

  it('should not emit when not near the bottom', async () => {
    stubViewportNotNearBottom();
    await fixture.whenStable();
    const countBeforeScroll = emitCount;
    window.dispatchEvent(new Event('scroll'));
    expect(emitCount).toBe(countBeforeScroll);
  });
});
