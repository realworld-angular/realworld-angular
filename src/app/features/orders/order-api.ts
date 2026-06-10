import { Injectable, ResourceRef, Signal, WritableSignal, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CouponValidation, Order } from './order.models';
import { Page } from '../../core/models/pagination.model';
import { PizzaOption } from '../pizzerias/models/pizza.models';
import type { Address } from '../../shared/models/address.model';

@Injectable({ providedIn: 'root' })
export class OrderApi {
  private readonly http = inject(HttpClient);

  public readonly sizesResource = httpResource<PizzaOption[]>(() => '/api/options/sizes', {
    defaultValue: [],
  });

  public createOrder(data: {
    pizzeriaId: string;
    deliveryAddress: Address;
    billingAddress?: Address;
    notes?: string;
    tipAmount?: number;
    scheduledAt?: string;
    couponCode?: string;
    items: {
      pizzaId: string;
      quantity: number;
      selectedSizeId?: string;
      selectedOptionIds: string[];
    }[];
  }): Observable<Order> {
    return this.http.post<Order>('/api/orders', data);
  }

  public validateCoupon(
    code: string,
    discount: WritableSignal<number>,
  ): Observable<CouponValidation> {
    return this.http
      .get<CouponValidation>(`/api/coupons/validate/${encodeURIComponent(code)}`)
      .pipe(
        tap({
          next: (response) => {
            if (!response.valid) {
              discount.set(0);
            } else {
              discount.set(response.discountPercent);
            }
          },
          error: () => {
            discount.set(0);
          },
        }),
      );
  }

  public cancelOrder(id: string): Observable<Order> {
    return this.http.patch<Order>(`/api/orders/${id}/cancel`, {});
  }

  public deliverOrder(id: string): Observable<Order> {
    return this.http.patch<Order>(`/api/orders/${id}/delivered`, {});
  }

  public getOrdersResource<T = Order>(
    page: Signal<number>,
    limit: number,
  ): ResourceRef<Page<T> | undefined> {
    return httpResource<Page<T>>(() => `/api/orders?page=${page()}&limit=${limit}`);
  }
}
