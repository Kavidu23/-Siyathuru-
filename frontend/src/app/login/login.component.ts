import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ModalService } from '../modal.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

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

    // Call backend login endpoint
    this.userService.loginUser(payload).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.success && res.token) {
          // Store token in localStorage
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('user', JSON.stringify(res.data));
          alert(res.message || 'Login successful!');
          this.resetForm();
          this.closeLogin();
        } else {
          alert(res?.message || 'Login failed.');
        }
      },
      (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        alert(err?.error?.error || 'Login failed. Please try again.');
      },
    );
  }
}
