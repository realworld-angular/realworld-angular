import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PhotonApi } from './photon-api';

const mockGeoJson = {
  features: [
    {
      properties: {
        name: 'Rome',
        city: 'Rome',
        country: 'Italy',
        type: 'city',
      },
    },
    {
      properties: {
        city: 'Naples',
        country: 'Italy',
      },
    },
    {
      properties: {
        country: 'Italy',
      },
    },
  ],
};

describe('PhotonApi', () => {
  let service: PhotonApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(PhotonApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('searchPlaces()', () => {
    it('should return empty array without HTTP call for queries shorter than 2 chars', () => {
      let result: unknown;
      service.searchPlaces('r').subscribe((r) => (result = r));
      httpTesting.expectNone(() => true);
      expect(result).toEqual([]);
    });

    it('should return empty array without HTTP call for empty query', () => {
      let result: unknown;
      service.searchPlaces('').subscribe((r) => (result = r));
      httpTesting.expectNone(() => true);
      expect(result).toEqual([]);
    });

    it('should GET the Photon API with trimmed query and lang=en', () => {
      service.searchPlaces('  rome  ').subscribe();
      const req = httpTesting.expectOne((r) => r.url.includes('photon.komoot.io'));
      expect(req.request.params.get('q')).toBe('rome');
      expect(req.request.params.get('lang')).toBe('en');
      req.flush(mockGeoJson);
    });

    it('should filter out suggestions missing city or country', () => {
      let results: unknown[];
      service.searchPlaces('rome').subscribe((r) => (results = r));
      const req = httpTesting.expectOne((r) => r.url.includes('photon.komoot.io'));
      req.flush(mockGeoJson);
      expect((results! as any[]).every((s) => s.city && s.country)).toBe(true);
    });

    it('should return empty array on HTTP error', () => {
      let results: unknown[];
      service.searchPlaces('rome').subscribe((r) => (results = r));
      const req = httpTesting.expectOne((r) => r.url.includes('photon.komoot.io'));
      req.flush('error', { status: 500, statusText: 'Server Error' });
      expect(results!).toEqual([]);
    });

    it('should map features to suggestions with city and country', () => {
      let results: any[] = [];
      service.searchPlaces('naples').subscribe((r) => (results = r));
      const req = httpTesting.expectOne((r) => r.url.includes('photon.komoot.io'));
      req.flush(mockGeoJson);
      expect(results.some((s) => s.city === 'Naples' && s.country === 'Italy')).toBe(true);
    });
  });
});
