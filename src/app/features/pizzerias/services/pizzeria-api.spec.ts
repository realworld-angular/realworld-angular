import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PizzeriaApi } from './pizzeria-api';

describe('PizzeriaApi', () => {
  let api: PizzeriaApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PizzeriaApi, provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PizzeriaApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
