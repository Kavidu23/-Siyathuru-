import { TestBed } from '@angular/core/testing';

import { ModalService } from './services/modal.service';
import { UserService } from './services/user.service';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            getCurrentUser: () => null,
          },
        },
      ],
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
