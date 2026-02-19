import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FooterComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  requestForm!: FormGroup;
  resetForm!: FormGroup;

  isResetMode = false;
  isLoading = false;
  submitted = false;
  message = '';
  error = '';
  resetToken = '';

  private querySub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.querySub = this.route.queryParamMap.subscribe((params) => {
      const token = params.get('token') || '';
      this.isResetMode = !!token;
      this.resetToken = token;
      this.submitted = false;
      this.message = '';
      this.error = '';
    });
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  get rf() {
    return this.requestForm.controls;
  }

  get pf() {
    return this.resetForm.controls;
  }

  sendResetLink() {
    this.submitted = true;
    this.message = '';
    this.error = '';

    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.requestForm.value.email;

    this.userService
      .requestPasswordReset(email)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.message =
            res?.message || 'If your email exists, a reset link has been sent to your inbox.';
        },
        error: (err: any) => {
          this.error = err?.error?.error || 'Failed to send reset link.';
        },
      });
  }

  submitNewPassword() {
    this.submitted = true;
    this.message = '';
    this.error = '';

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const password = this.resetForm.value.password;
    const confirmPassword = this.resetForm.value.confirmPassword;

    if (password !== confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    if (!this.resetToken) {
      this.error = 'Invalid reset token.';
      return;
    }

    this.isLoading = true;
    this.userService
      .resetPassword(this.resetToken, password)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.message = res?.message || 'Password reset successful.';
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1500);
        },
        error: (err: any) => {
          this.error = err?.error?.error || 'Reset link is invalid or expired.';
        },
      });
  }
}
