import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { PizzeriaApi } from '../../services/pizzeria-api';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { HeroBanner } from '../../../../shared/components/hero-banner/hero-banner';
import { CatalogImageUrlPipe } from '../../../../shared/pipes/catalog-image-url.pipe';
import { FormsModule } from '@angular/forms';
import { Callout } from '../../../../shared/components/callout/callout';

@Component({
  selector: 'rw-pizzeria-list-page',
  imports: [
    RouterLink,
    NgOptimizedImage,
    Spinner,
    Pagination,
    EmptyState,
    HeroBanner,
    CatalogImageUrlPipe,
    FormsModule,
    Callout,
  ],
  templateUrl: './pizzeria-list-page.html',
  styleUrl: './pizzeria-list-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PizzeriaListPage {
  private readonly document = inject(DOCUMENT);
  private readonly pizzeriaApi = inject(PizzeriaApi);

  // Search input
  protected readonly searchInput = signal('');
  private readonly debouncedSearch = toSignal(
    toObservable(this.searchInput).pipe(
      debounceTime(300),
      map((search: string) => search.trim()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );
  protected readonly hasActiveSearch = computed<boolean>(() => this.debouncedSearch().length > 0);

  // Pagination
  protected readonly currentPage = signal(1);
  protected readonly limit = 12;

  protected readonly pizzeriasResource =
    this.pizzeriaApi.getPizzeriaListResource(this.currentPage, this.limit, this.debouncedSearch);

  protected changePage(page: number): void {
    this.currentPage.set(page);
    this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
