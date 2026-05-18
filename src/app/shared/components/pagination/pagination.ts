import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'rw-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  public readonly currentPage = input.required<number>();
  public readonly totalPages = input.required<number>();
  public readonly pageChange = output<number>();

  protected readonly visiblePages = computed<number[]>(() => {
    const pages: number[] = [];
    const delta = 2;

    for (let pageIndex = 1; pageIndex <= this.totalPages(); pageIndex++) {
      if (
        pageIndex === 1 ||
        pageIndex === this.totalPages() ||
        (pageIndex >= this.currentPage() - delta && pageIndex <= this.currentPage() + delta)
      ) {
        pages.push(pageIndex);
      } else if (pages[pages.length - 1] !== -1) {
        pages.push(-1); // ellipsis marker
      }
    }

    return pages;
  });
}
