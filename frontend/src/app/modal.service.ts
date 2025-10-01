// modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private loginVisible = new BehaviorSubject(false);
  private signupVisible = new BehaviorSubject(false);

  loginVisible$ = this.loginVisible.asObservable();
  signupVisible$ = this.signupVisible.asObservable();

  openSignup() {
    this.signupVisible.next(true);
  }

  closeSignup() {
    this.signupVisible.next(false);
  }

  openLogin() {
    this.loginVisible.next(true);
  }

  closeLogin() {
    this.loginVisible.next(false);
  }
}
