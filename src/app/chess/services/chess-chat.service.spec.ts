import { TestBed } from '@angular/core/testing';

import { ChessChatService } from './chess-chat.service';

describe('ChessChatService', () => {
  let service: ChessChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChessChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
