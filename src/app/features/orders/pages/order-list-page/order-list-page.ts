import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Auth } from '../../../../core/services/auth';
import { Page } from '../../../../core/models/pagination.model';
import { Order } from '../../order.models';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Callout } from '../../../../shared/components/callout/callout';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'rw-orders-list-page',
  imports: [
    RouterLink,
    DecimalPipe,
    DatePipe,
    Spinner,
    Pagination,
    EmptyState,
    Callout,
    StatusBadge,
  ],
  templateUrl: './order-list-page.html',
  styleUrl: './order-list-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersListPage {
  private readonly auth = inject(Auth);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  protected readonly heading = computed<string>(() =>
    this.auth.isAdmin() ? 'Orders' : 'My Orders',
  );

  protected readonly currentPage = signal(1);
  protected readonly ordersResource = httpResource<Page<Order>>(
    () => `/api/orders?page=${this.currentPage()}&limit=10`,
  );

  public constructor() {
    effect(() => {
      this.title.setTitle(this.heading());
    });
  }

  protected changePage(page: number): void {
    this.currentPage.set(page);
    this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
