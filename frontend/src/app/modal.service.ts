// modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private loginVisible = new BehaviorSubject(false);
  loginVisible$ = this.loginVisible.asObservable();

  openLogin() {
    this.loginVisible.next(true);
  }

  closeLogin() {
    this.loginVisible.next(false);
  }
}
