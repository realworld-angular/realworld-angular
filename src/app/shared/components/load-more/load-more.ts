import { afterNextRender, Component, DestroyRef, inject, input, output } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'rw-load-more',
  templateUrl: './load-more.html',
  styleUrl: './load-more.css',
})
export class LoadMore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  public readonly threshold = input(320);

  public readonly loadMore = output<void>();

  public constructor() {
    afterNextRender(() => {
      const win = this.document.defaultView;
      if (!win) return;

      const checkNearBottom = (): void => {
        const doc = this.document.documentElement;
        const nearBottom = win.scrollY + win.innerHeight >= doc.scrollHeight - this.threshold();
        if (nearBottom) {
          this.loadMore.emit();
        }
      };

      win.addEventListener('scroll', checkNearBottom, { passive: true });
      this.destroyRef.onDestroy(() => win.removeEventListener('scroll', checkNearBottom));

      const resizeObserver = new ResizeObserver(() => checkNearBottom());
      resizeObserver.observe(this.document.documentElement);
      this.destroyRef.onDestroy(() => resizeObserver.disconnect());

      checkNearBottom();
    });
  }
}
