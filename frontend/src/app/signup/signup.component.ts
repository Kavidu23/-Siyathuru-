import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';

import { ModalService } from '../modal.service';
import { Subscription } from 'rxjs';
import imageCompression from 'browser-image-compression';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy {
  @Output() switchToLogin = new EventEmitter<void>();

  userForm!: FormGroup;
  isVisible: boolean = false;
  isLoading: boolean = false;
  isProfileUploading = false;
  submitted = false;

  profileFile: File | null = null;
  profilePreview: string | ArrayBuffer | null = null;

  subscription!: Subscription;

  constructor(private fb: FormBuilder, private modalService: ModalService) {
    this.initForm();
  }

  ngOnInit() {
    this.subscription = this.modalService.signupVisible$.subscribe(
      (visible) => {
        this.isVisible = visible;
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  initForm() {
    this.userForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        latitude: [
          '',
          [Validators.required, Validators.min(-90), Validators.max(90)],
        ],
        longitude: [
          '',
          [Validators.required, Validators.min(-180), Validators.max(180)],
        ],
        age: [
          '',
          [Validators.required, Validators.min(13), Validators.max(120)],
        ],
        memberType: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;

    return password === confirm ? null : { mismatch: true };
  }

  openSignup() {
    this.modalService.openSignup();
  }

  closeSignup() {
    this.modalService.closeSignup();
  }

  openLogin() {
    this.modalService.closeSignup();
    this.modalService.openLogin();
  }

  async onProfileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isProfileUploading = true;

    try {
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 600,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      this.profileFile = compressedFile;

      const reader = new FileReader();
      reader.onload = () => {
        this.profilePreview = reader.result;
      };
      reader.readAsDataURL(compressedFile);
      this.isProfileUploading = false;
    } catch (error) {
      console.error('Image compression error:', error);
      this.isProfileUploading = false;
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      alert('Please correct the errors in the form.');
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('username', this.userForm.value.username);
    formData.append('email', this.userForm.value.email);
    formData.append('phone', this.userForm.value.phone);
    formData.append('password', this.userForm.value.password);
    formData.append('latitude', this.userForm.value.latitude);
    formData.append('longitude', this.userForm.value.longitude);
    formData.append('age', this.userForm.value.age);
    formData.append('memberType', this.userForm.value.memberType);

    if (this.profileFile) {
      formData.append('profilePic', this.profileFile);
    }

    setTimeout(() => {
      this.isLoading = false;
      alert('Account Created Successfully!');
      this.closeSignup();
    }, 2000);
  }
}
