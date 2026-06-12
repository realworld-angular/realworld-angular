import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  input,
  DestroyRef,
  effect,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderApi } from '../../services/order-api';
import { Callout } from '../../../../shared/components/callout/callout';
import { Order } from '../../order.models';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Button } from '../../../../shared/components/button/button';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Observable } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'rw-order-detail-page',
  imports: [
    RouterLink,
    DecimalPipe,
    DatePipe,
    TitleCasePipe,
    Spinner,
    Button,
    Callout,
    EmptyState,
    StatusBadge,
  ],
  templateUrl: './order-details-page.html',
  styleUrl: './order-details-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPage {
  private readonly api = inject(OrderApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);

  protected readonly orderResource = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => {
      return new Observable<Order>((observer) => {
        const es = new EventSource(`${environment.apiBaseUrl}/api/orders/${id}/subscribe`, {
          withCredentials: true,
        });

        es.onmessage = (event: MessageEvent<string>): void => {
          try {
            observer.next(JSON.parse(event.data));
          } catch {
            observer.error(new Error('Malformed payload'));
          }
        };

        es.onerror = (): void => {
          observer.error(new Error('SSE connection error'));
          es.close();
        };

        // Cleanup when unsubscribed
        return (): void => es.close();
      });
    },
  });

  protected readonly isCancelling = signal(false);
  protected readonly cancelFeedback = signal<{
    variant: 'error' | 'success';
    message: string;
  } | null>(null);

  protected readonly statusOrder: readonly string[] = [
    'PENDING',
    'PREPARING',
    'READY',
    'DELIVERED',
  ];

  protected readonly isStepDone = computed(() => {
    const order = this.orderResource.value()!;
    return (step: string): boolean => {
      if (step === 'DELIVERED' && order.status === 'DELIVERED') {
        return true;
      }
      return this.statusOrder.indexOf(order.status) > this.statusOrder.indexOf(step);
    };
  });

  public readonly id = input.required<string>();

  public constructor() {
    effect(() => {
      this.title.setTitle(`Order ${this.id()}`);
    });
  }

  protected cancel(): void {
    this.isCancelling.set(true);
    this.cancelFeedback.set(null);
    this.api
      .cancelOrder(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          this.orderResource.set(order);
          this.isCancelling.set(false);
          this.cancelFeedback.set({
            variant: 'success',
            message: 'This order has been cancelled.',
          });
        },
        error: (err) => {
          this.isCancelling.set(false);
          this.cancelFeedback.set({
            variant: 'error',
            message: err?.error?.message ?? 'Could not cancel order',
          });
        },
      });
  }
}
