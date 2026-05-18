import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

export type CatalogImageKind = 'pizzeria' | 'pizza';

@Pipe({
  name: 'catalogImageUrl',
})
export class CatalogImageUrlPipe implements PipeTransform {
  transform(filename: string, kind: CatalogImageKind): string {
    const segment = kind === 'pizzeria' ? 'pizzerias' : 'pizzas';
    return `${environment.apiBaseUrl}/images/${segment}/${encodeURIComponent(filename)}`;
  }
}
