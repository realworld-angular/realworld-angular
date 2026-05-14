import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PhotonApi, isPhotonApiUrl, PhotonLocationSuggestion } from './photon-api';

describe('isPhotonApiUrl', () => {
  it('should return true for photon.komoot.io URLs', () => {
    expect(isPhotonApiUrl('https://photon.komoot.io/api/?q=Paris')).toBe(true);
  });

  it('should return false for non-photon URLs', () => {
    expect(isPhotonApiUrl('https://api.example.com/places')).toBe(false);
  });
});

describe('PhotonApi', () => {
  let service: PhotonApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PhotonApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchPlaces()', () => {
    it('should return empty array without HTTP call when query is less than 2 chars', () => {
      let result: PhotonLocationSuggestion[] | undefined;
      service.searchPlaces('').subscribe((response) => (result = response));
      httpMock.expectNone('https://photon.komoot.io/api/');
      expect(result).toEqual([]);

      service.searchPlaces('P').subscribe((response) => (result = response));
      httpMock.expectNone('https://photon.komoot.io/api/');
      expect(result).toEqual([]);
    });

    it('should call photon API with trimmed query, lang=en and default limit=10', () => {
      service.searchPlaces('  Paris  ').subscribe();
      const req = httpMock.expectOne((request) => request.url === 'https://photon.komoot.io/api/');
      expect(req.request.params.get('q')).toBe('Paris');
      expect(req.request.params.get('lang')).toBe('en');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush({ features: [] });
    });

    it('should call photon API with custom limit', () => {
      service.searchPlaces('Paris', 5).subscribe();
      const req = httpMock.expectOne((request) => request.url === 'https://photon.komoot.io/api/');
      expect(req.request.params.get('limit')).toBe('5');
      req.flush({ features: [] });
    });

    it('should map features to PhotonLocationSuggestion and filter out entries missing city or country', () => {
      let result: PhotonLocationSuggestion[] | undefined;
      service.searchPlaces('Paris').subscribe((response) => (result = response));

      const req = httpMock.expectOne((request) => request.url === 'https://photon.komoot.io/api/');
      req.flush({
        features: [
          // valid – has city and country
          { properties: { name: 'Eiffel Tower', city: 'Paris', country: 'France' } },
          // missing country → filtered out
          { properties: { name: 'NoCountry', city: 'Somewhere' } },
          // missing city → filtered out
          { properties: { name: 'NoCity', country: 'France' } },
          // valid – uses town as city fallback
          { properties: { name: 'Lyon', town: 'Lyon', country: 'France' } },
        ],
      });

      expect(result).toEqual([
        { label: 'Eiffel Tower, Paris, France', city: 'Paris', country: 'France' },
        { label: 'Lyon', city: 'Lyon', country: 'France' },
      ]);
    });

    it('should use village as city fallback', () => {
      let result: PhotonLocationSuggestion[] | undefined;
      service.searchPlaces('Giverny').subscribe((response) => (result = response));

      const req = httpMock.expectOne((request) => request.url === 'https://photon.komoot.io/api/');
      req.flush({
        features: [{ properties: { village: 'Giverny', country: 'France' } }],
      });

      expect(result?.[0].city).toBe('Giverny');
    });

    it('should use name as city when type matches city/town/village/locality/district', () => {
      let result: PhotonLocationSuggestion[] | undefined;
      service.searchPlaces('Berlin').subscribe((response) => (result = response));

      const req = httpMock.expectOne((request) => request.url === 'https://photon.komoot.io/api/');
      req.flush({
        features: [{ properties: { name: 'Berlin', type: 'city', country: 'Germany' } }],
      });

      expect(result?.[0].city).toBe('Berlin');
      expect(result?.[0].country).toBe('Germany');
    });

    it('should deduplicate label parts (city same as name)', () => {
      let result: PhotonLocationSuggestion[] | undefined;
      service.searchPlaces('Lyon').subscribe((response) => (result = response));

      const req = httpMock.expectOne((request) => request.url === 'https://photon.komoot.io/api/');
      req.flush({
        features: [{ properties: { name: 'Lyon', city: 'Lyon', country: 'France' } }],
      });

      expect(result?.[0].label).toBe('Lyon, France');
    });

    it('should return empty array and not throw on HTTP error', () => {
      let result: PhotonLocationSuggestion[] | undefined;
      service.searchPlaces('Paris').subscribe((response) => (result = response));

      const req = httpMock.expectOne((request) => request.url === 'https://photon.komoot.io/api/');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      expect(result).toEqual([]);
    });

    it('should return empty array when features is missing from response', () => {
      let result: PhotonLocationSuggestion[] | undefined;
      service.searchPlaces('Paris').subscribe((response) => (result = response));

      const req = httpMock.expectOne((request) => request.url === 'https://photon.komoot.io/api/');
      req.flush({});

      expect(result).toEqual([]);
    });
  });
});
