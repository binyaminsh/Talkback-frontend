import { TestBed } from '@angular/core/testing';

import { SignalrUsersService } from './signalr-users.service';

describe('SignalrUsersService', () => {
  let service: SignalrUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalrUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
