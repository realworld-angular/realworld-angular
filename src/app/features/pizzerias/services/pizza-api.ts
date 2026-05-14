import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pizza } from '../models/pizza.models';

@Injectable({ providedIn: 'root' })
export class PizzaApi {
  private readonly http = inject(HttpClient);

  /** Admin: create a pizza in the current admin's pizzeria. */
  public createMyPizza(
    data: { basePrice: number; imageFilename: string; toppingIds: string[] },
  ): Observable<Pizza> {
    return this.http.post<Pizza>('/api/admin/pizzeria/pizzas', data);
  }

  /** Admin: update a pizza in the current admin's pizzeria. */
  public updateMyPizza(
    pizzaId: string,
    data: Partial<{ basePrice: number; imageFilename: string; toppingIds: string[] }>,
  ): Observable<Pizza> {
    return this.http.patch<Pizza>(`/api/admin/pizzeria/pizzas/${pizzaId}`, data);
  }

  /** Admin: delete a pizza from the current admin's pizzeria. */
  public deleteMyPizza(pizzaId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/admin/pizzeria/pizzas/${pizzaId}`);
  }

  // Legacy methods kept for public-facing pizzeria detail page
  public createPizza(
    pizzeriaId: string,
    data: { basePrice: number; imageFilename: string; toppingIds: string[] },
  ): Observable<Pizza> {
    return this.http.post<Pizza>(`/api/pizzerias/${pizzeriaId}/pizzas`, data);
  }

  public updatePizza(
    pizzeriaId: string,
    pizzaId: string,
    data: Partial<{ basePrice: number; imageFilename: string; toppingIds: string[] }>,
  ): Observable<Pizza> {
    return this.http.patch<Pizza>(`/api/pizzerias/${pizzeriaId}/pizzas/${pizzaId}`, data);
  }

  public deletePizza(pizzeriaId: string, pizzaId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/pizzerias/${pizzeriaId}/pizzas/${pizzaId}`);
  }
}
