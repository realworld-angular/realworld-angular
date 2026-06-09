import { Injectable, ResourceRef, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pizza, PizzaOption } from '../models/pizza.models';

@Injectable({ providedIn: 'root' })
export class PizzaApi {
  private readonly http = inject(HttpClient);

  public readonly toppingsResource = httpResource<PizzaOption[]>(() => '/api/options/toppings', {
    defaultValue: [],
  });

  /** Admin: create a pizza in the current admin's pizzeria. */
  public createPizza(data: {
    basePrice: number;
    imageFilename: string;
    toppingIds: string[];
  }): Observable<Pizza> {
    return this.http.post<Pizza>('/api/admin/pizzeria/pizzas', data);
  }

  /** Admin: update a pizza in the current admin's pizzeria. */
  public updatePizza(
    pizzaId: string,
    data: Partial<{ basePrice: number; imageFilename: string; toppingIds: string[] }>,
  ): Observable<Pizza> {
    return this.http.patch<Pizza>(`/api/admin/pizzeria/pizzas/${pizzaId}`, data);
  }

  /** Admin: delete a pizza from the current admin's pizzeria. */
  public deletePizza(pizzaId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/admin/pizzeria/pizzas/${pizzaId}`);
  }

  public getPizzasResource(): ResourceRef<Pizza[]> {
    return httpResource<Pizza[]>(() => '/api/admin/pizzeria/pizzas', {
      defaultValue: [],
    });
  }
}
