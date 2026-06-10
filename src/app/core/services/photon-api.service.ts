import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { PhotonLocationSuggestion } from '../../shared/components/photon-location-field/photon-location-field';
import { PhotonQuery } from '../models/photon-query.model';

@Injectable({ providedIn: 'root' })
export class PhotonApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://photon.komoot.io';

  public readonly user = signal<User | null>(null);

  public search(params: PhotonQuery): Observable<PhotonLocationSuggestion[]> {
    return this.http.get<PhotonLocationSuggestion[]>(this.baseUrl + '/api', {
      params: {
        q: params.q,
        lang: params.lang,
        limit: params.limit
      }
    }).pipe(map(parsePhotonGeoJson));
  }
}

function parsePhotonGeoJson(raw: unknown): PhotonLocationSuggestion[] {
  const doc = raw as {
    features?: {
      properties?: Record<string, string | undefined>;
    }[];
  };
  return (doc.features ?? [])
    .map((f) => {
      const props = f.properties ?? {};
      const city = pickCity(props);
      const country = (props['country'] ?? '').trim();
      return { label: buildLabel(props, city, country), city, country };
    })
    .filter((s) => s.city && s.country);
}

function pickCity(props: Record<string, string | undefined>): string {
  const fromAdmin = (
    props['city'] ??
    props['town'] ??
    props['village'] ??
    props['locality'] ??
    props['district'] ??
    props['county'] ??
    ''
  ).trim();
  if (fromAdmin) {
    return fromAdmin;
  }
  const type = (props['type'] ?? '').toLowerCase();
  const name = (props['name'] ?? '').trim();
  if (
    name &&
    (type === 'city' || type === 'town' || type === 'village' || type === 'locality' || type === 'district')
  ) {
    return name;
  }
  return name;
}

function buildLabel(props: Record<string, string | undefined>, city: string, country: string): string {
  const name = (props['name'] ?? '').trim();
  const parts: string[] = [];
  if (name && name.toLowerCase() !== city.toLowerCase()) {
    parts.push(name);
  }
  if (city) {
    parts.push(city);
  }
  if (country) {
    parts.push(country);
  }
  return [...new Set(parts)].join(', ');
}
