import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

/** True when `url` targets Photon (Komoot) — used to skip global credentials on those requests. */
export function isPhotonApiUrl(url: string): boolean {
  return url.includes('photon.komoot.io');
}

export interface PhotonLocationSuggestion {
  /** Single-line label for the input after selection */
  label: string;
  city: string;
  country: string;
}

interface PhotonProperties {
  name?: string;
  city?: string;
  town?: string;
  village?: string;
  locality?: string;
  district?: string;
  county?: string;
  country?: string;
  type?: string;
}

interface PhotonFeature {
  properties?: PhotonProperties;
}

interface PhotonGeoJson {
  features?: PhotonFeature[];
}

@Injectable({ providedIn: 'root' })
export class PhotonApi {
  private readonly http = inject(HttpClient);

  /**
   * Typeahead search. Returns suggestions with non-empty city and country
   * derived from OSM tags (see Photon GeoJSON docs).
   */
  public searchPlaces(query: string, limit = 10): Observable<PhotonLocationSuggestion[]> {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return of([]);
    }
    const params = new HttpParams().set('q', trimmedQuery).set('lang', 'en').set('limit', String(limit));
    return this.http.get<PhotonGeoJson>(`https://photon.komoot.io/api/`, { params }).pipe(
      map((doc) => (doc.features ?? []).map((feature) => this.toSuggestion(feature)).filter((suggestion) => suggestion.city && suggestion.country)),
      catchError(() => of([])),
    );
  }

  private toSuggestion(feature: PhotonFeature): PhotonLocationSuggestion {
    const props = feature.properties ?? {};
    const city = this.pickCity(props);
    const country = (props.country ?? '').trim();
    const label = this.buildLabel(props, city, country);
    return { label, city, country };
  }

  private pickCity(props: PhotonProperties): string {
    const fromAdmin = (
      props.city ??
      props.town ??
      props.village ??
      props.locality ??
      props.district ??
      props.county ??
      ''
    ).trim();
    if (fromAdmin) {
      return fromAdmin;
    }
    const type = (props.type ?? '').toLowerCase();
    const name = (props.name ?? '').trim();
    if (name && (type === 'city' || type === 'town' || type === 'village' || type === 'locality' || type === 'district')) {
      return name;
    }
    return name;
  }

  private buildLabel(p: PhotonProperties, city: string, country: string): string {
    const name = (p.name ?? '').trim();
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
}
