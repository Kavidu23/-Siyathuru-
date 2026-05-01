// modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private loginVisible = new BehaviorSubject(false);
  private signupVisible = new BehaviorSubject(false);
  private signupVerificationEmail = new BehaviorSubject<string | null>(null);

  loginVisible$ = this.loginVisible.asObservable();
  signupVisible$ = this.signupVisible.asObservable();
  signupVerificationEmail$ = this.signupVerificationEmail.asObservable();

  constructor(private userService: UserService) {}

  openSignup() {
    this.signupVisible.next(true);
  }

  openSignupForVerification(email: string) {
    this.loginVisible.next(false);
    this.signupVisible.next(true);
    this.signupVerificationEmail.next(email);
  }

  closeSignup() {
    this.signupVisible.next(false);
  }

  clearSignupVerificationEmail() {
    this.signupVerificationEmail.next(null);
  }

  openLogin() {
    const user = this.userService.getCurrentUser();
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
}
