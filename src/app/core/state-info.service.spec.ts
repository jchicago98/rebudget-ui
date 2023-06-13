import { TestBed } from '@angular/core/testing';

import { StateInfoService } from './state-info.service';

describe('StateInfoService', () => {
  let service: StateInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
