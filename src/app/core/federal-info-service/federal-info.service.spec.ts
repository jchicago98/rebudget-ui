import { TestBed } from '@angular/core/testing';

import { FederalInfoService } from './federal-info.service';

describe('FederalInfoService', () => {
  let service: FederalInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FederalInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
