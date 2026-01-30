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
    const user = this.isUserLoggedIn();
    if (user) {
      alert(
        `You are already logged in as ${user.name}. Please logout to login with another account.`,
      );
      return;
    }
    this.loginVisible.next(true);
  }

  closeLogin() {
    this.loginVisible.next(false);
  }

  private isUserLoggedIn(): any {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  }
}
