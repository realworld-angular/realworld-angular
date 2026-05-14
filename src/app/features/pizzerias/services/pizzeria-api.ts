import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PizzeriaDetail } from '../models/pizzeria.models';

@Injectable({ providedIn: 'root' })
export class PizzeriaApi {
  private readonly http = inject(HttpClient);

  public createPizzeria(data: {
    city: string;
    country: string;
    imageFilename: string;
  }): Observable<PizzeriaDetail> {
    return this.http.post<PizzeriaDetail>('/api/pizzerias', data);
  }

  /** Admin: update the current admin's pizzeria (no id needed). */
  public updateMyPizzeria(
    data: { city?: string; country?: string; imageFilename?: string },
  ): Observable<PizzeriaDetail> {
    return this.http.patch<PizzeriaDetail>('/api/pizzerias/admin/pizzeria', data);
  }

  /** Admin: delete the current admin's pizzeria (no id needed). */
  public deleteMyPizzeria(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>('/api/pizzerias/admin/pizzeria');
  }
}
