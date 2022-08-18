import { TestBed } from '@angular/core/testing';

import { SignalrChessService } from './signalr-chess.service';

describe('SignalrChessService', () => {
  let service: SignalrChessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalrChessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
