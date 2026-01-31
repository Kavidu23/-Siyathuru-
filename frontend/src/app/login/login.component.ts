import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ModalService } from '../services/modal.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class LoginComponent implements OnInit, OnDestroy {
  isVisible = false;
  isLoading = false;
  submitted = false;
  loginForm!: FormGroup;
  subscription!: Subscription;

  constructor(
    private modalService: ModalService,
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.initLoginForm();
  }

  ngOnInit() {
    this.subscription = this.modalService.loginVisible$.subscribe((visible) => {
      this.isVisible = visible;
      if (visible) {
        this.resetForm();
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  initLoginForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  // Switch to signup modal
  openSignup() {
    this.modalService.closeLogin();
    this.modalService.openSignup();
  }

  closeLogin() {
    this.modalService.closeLogin();
  }

  resetForm() {
    this.loginForm.reset();
    this.submitted = false;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      alert('Please enter valid email and password.');
      return;
    }

    this.isLoading = true;

    const payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.userService
      .loginUser(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(
        (res: any) => {
          if (res && res.success) {
            // Store user data
            if (res.user) {
              localStorage.setItem('user', JSON.stringify(res.user));
            }
            alert('Login successful!');
            this.closeLogin();
            // Navigate instead of reload
            window.location.reload();
          }
        },
        (err: any) => {
          console.error('Login error:', err);
          alert(err?.error?.error || 'Login failed. Please try again.');
        },
      );
  }
}
