import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Callout } from '../../../../shared/components/callout/callout';
import { Page } from '../../../../core/models/pagination.model';
import { AdminOrderListItem } from '../../order.models';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { AdminOrderRow } from './admin-order-row/admin-order-row';

@Component({
  selector: 'rw-admin-orders-page',
  imports: [Spinner, Pagination, Callout, EmptyState, AdminOrderRow],
  templateUrl: './admin-order-list-page.html',
  styleUrl: './admin-order-list-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderListPage {
  public readonly ordersResource = httpResource<Page<AdminOrderListItem>>(
    () => `/api/orders?page=${this.currentPage()}&limit=${this.limit}`,
  );

  protected readonly currentPage = signal(1);
  protected readonly limit = 15;
  protected readonly cancelFeedback = signal<{ variant: 'error' | 'success'; message: string } | null>(null);

  protected changePage(page: number): void {
    this.currentPage.set(page);
  }

  protected updateOrder(updated: AdminOrderListItem): void {
    const page = this.ordersResource.value();
    if (!page) {
      return;
    }
    this.ordersResource.set({
      ...page,
      items: page.items.map((orderItem) => (orderItem.id === updated.id ? updated : orderItem)),
    });
  }

  protected showFeedback(fb: { variant: 'error' | 'success'; message: string }): void {
    this.cancelFeedback.set(fb);
  }
}
