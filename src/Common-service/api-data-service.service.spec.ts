import { TestBed } from '@angular/core/testing';

import { ApiDataServiceService } from './api-data-service.service';

describe('ApiDataServiceService', () => {
  let service: ApiDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
