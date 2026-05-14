import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from './order.models';
import type { Address } from '../../shared/models/address.model';

@Injectable({ providedIn: 'root' })
export class OrderApi {
  private readonly http = inject(HttpClient);

  public createOrder(data: {
    pizzeriaId: string;
    deliveryAddress: Address;
    billingAddress?: Address;
    notes?: string;
    items: {
      pizzaId: string;
      quantity: number;
      selectedSizeId?: string;
      selectedOptionIds: string[];
    }[];
  }): Observable<Order> {
    return this.http.post<Order>('/api/orders', data);
  }

  public cancelOrder(id: string): Observable<Order> {
    return this.http.patch<Order>(`/api/orders/${id}/cancel`, {});
  }

  public deliverOrder(id: string): Observable<Order> {
    return this.http.patch<Order>(`/api/orders/${id}/delivered`, {});
  }
}
