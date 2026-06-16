import { inject, Signal, ResourceRef, ResourceParamsStatus, Service } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../../../core/models/pagination.model';
import { PizzeriaDetail, PizzeriaSummary } from '../models/pizzeria.models';
import { Pizza } from '../models/pizza.models';

@Service()
export class PizzeriaApi {
  private readonly http = inject(HttpClient);

  public getImagesResource(): ResourceRef<string[]> {
    return httpResource<string[]>(() => '/api/pizzerias/images', {
      defaultValue: [],
    });
  }

  public getMyPizzeria(): Observable<PizzeriaDetail> {
    return this.http.get<PizzeriaDetail>('/api/pizzerias/admin/pizzeria');
  }

  public createPizzeria(data: {
    city: string;
    country: string;
    imageFilename: string;
  }): Observable<PizzeriaDetail> {
    return this.http.post<PizzeriaDetail>('/api/pizzerias', data);
  }

  public updateMyPizzeria(data: {
    city?: string;
    country?: string;
    imageFilename?: string;
  }): Observable<PizzeriaDetail> {
    return this.http.patch<PizzeriaDetail>('/api/pizzerias/admin/pizzeria', data);
  }

  public deleteMyPizzeria(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>('/api/pizzerias/admin/pizzeria');
  }

  public getPizzeriaByIdResource(id: Signal<string>): ResourceRef<PizzeriaDetail | undefined> {
    return httpResource<PizzeriaDetail>(() => `/api/pizzerias/${id()}`);
  }

  public getMyPizzeriaResource(): ResourceRef<PizzeriaDetail | undefined> {
    return httpResource<PizzeriaDetail>(() => '/api/pizzerias/admin/pizzeria');
  }

  public getPizzeriaListResource(
    page: Signal<number>,
    limit: number,
    search: Signal<string>,
    pendingSearch: Signal<string>,
  ): ResourceRef<Page<PizzeriaSummary> | undefined> {
    return httpResource<Page<PizzeriaSummary>>(() => {
      if (pendingSearch().trim() !== search()) {
        throw ResourceParamsStatus.LOADING;
      }
      return {
        url: '/api/pizzerias',
        params: {
          page: page(),
          limit,
          ...(search() ? { search: search() } : {}),
        },
      };
    });
  }

  public getPizzeriaPizzasResource(
    pizzeriaId: Signal<string>,
    pizzeriaResource: ResourceRef<PizzeriaDetail | undefined>,
    page: Signal<number>,
    filterParams: Signal<Record<string, string | number | boolean>>,
  ): ResourceRef<Page<Pizza> | undefined> {
    return httpResource<Page<Pizza>>(({ chain }) => {
      chain(pizzeriaResource);
      return {
        url: `/api/pizzerias/${pizzeriaId()}/pizzas`,
        params: {
          page: page(),
          limit: 8,
          ...filterParams(),
        },
      };
    });
  }
}
