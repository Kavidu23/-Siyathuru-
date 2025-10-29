import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from '../modal.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  isVisible = false;
  subscription!: Subscription;

  isLoading = false;
  submitted = false;

  constructor(
    private modalService: ModalService,
    private userSerivce: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      latitude: ['', [Validators.required, Validators.pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/)]],
      longitude: ['', [Validators.required, Validators.pattern(/^[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?|180(\.0+)?$/)]],
      age: ['', [Validators.required, Validators.min(13), Validators.max(120)]],
      memberType: ['', Validators.required],
      // profile: [null] // placeholder for future profile image
    });
  }

  get f() {
    return this.userForm.controls;
  }

  onSubmit() {
    if (this.userForm.invalid) {
      alert('All required fields must be completed with correct details.');
      return;
    }

    this.submitted = true;
    this.isLoading = true;

    const formData = new FormData();
    formData.append('username', this.userForm.get('username')?.value);
    formData.append('email', this.userForm.get('email')?.value);
    formData.append('phone', this.userForm.get('phone')?.value);
    formData.append('password', this.userForm.get('password')?.value);
    formData.append('age', this.userForm.get('age')?.value);
    formData.append('memberType', this.userForm.get('memberType')?.value);

    // Append location coordinates
    formData.append('latitude', this.userForm.get('latitude')?.value);
    formData.append('longitude', this.userForm.get('longitude')?.value);

    // TODO: Append profile image when implemented
    // const profileFile = this.userForm.get('profile')?.value;
    // if (profileFile) formData.append('profile', profileFile);

    this.userSerivce.createUser(formData).subscribe({
      next: res => {
        alert('Account created successfully!');
        this.onReset();
        this.isLoading = false;
        const userId = res.data._id;
        this.router.navigate(['/user-dashboard', userId]);
      },
      error: err => {
        this.isLoading = false;
        if (err.error?.message === "Duplicate field value") {
          alert('These details have been registered before');
          return;
        }
        console.error(err);
        alert('Failed to create account. Check console for details.');
      }
    });
  }

  onReset() {
    this.submitted = false;
    this.userForm.reset();
  }

  // switch to login modal
  openLogin() {
    this.modalService.openLogin();
    this.modalService.closeSignup();
  }

  ngOnInit() {
    this.subscription = this.modalService.signupVisible$.subscribe(visible => {
      this.isVisible = visible;
    });
  }

  closeSignup() {
    this.modalService.closeSignup();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
