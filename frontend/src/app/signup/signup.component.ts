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

import { HttpClient } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { ModalService } from '../services/modal.service';
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
  verifyForm!: FormGroup;
  isVisible: boolean = false;
  isLoading: boolean = false;
  isProfileUploading = false;
  submitted = false;
  cities: any[] = [];
  verificationPending = false;
  createdEmail: string | null = null;

  profileFile: File | null = null;
  profilePreview: string | ArrayBuffer | null = null;

  subscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private http: HttpClient,
    private userService: UserService,
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.subscription = this.modalService.signupVisible$.subscribe(
      (visible) => {
        this.isVisible = visible;
      },
    );

    this.http.get<any[]>('districts.json').subscribe(
      (data: any[]) => {
        // Map district objects to the shape expected by the template
        this.cities = data.map((d: any, i: number) => ({
          id: i,
          name_en: d.district,
          latitude: d.lat,
          longitude: d.lng,
        }));
        // optional: sort alphabetically
        this.cities.sort((a: any, b: any) =>
          a.name_en.localeCompare(b.name_en),
        );
      },
      (error: any) => console.error('Could not load districts.json', error),
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
        city: ['', Validators.required],
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
      { validators: this.passwordMatchValidator },
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

    // Map frontend form to backend expected payload
    const payload: any = {
      name: this.userForm.value.username,
      email: this.userForm.value.email,
      pnumber: this.userForm.value.phone,
      password: this.userForm.value.password,
      role: this.userForm.value.memberType,
      age: Number(this.userForm.value.age),
      location: {
        coordinates: {
          latitude: Number(this.userForm.value.latitude) || 0,
          longitude: Number(this.userForm.value.longitude) || 0,
        },
      },
      // profileImage: (you may upload to cloudinary first and set URL here)
    };

    // Upload profile image if selected, then create user
    if (this.profileFile) {
      this.userService.uploadProfileImage(this.profileFile).subscribe(
        (uploadRes) => {
          payload.profileImage = uploadRes.data?.url || uploadRes.url;
          this.submitUserWithImage(payload);
        },
        (uploadErr) => {
          console.warn(
            'Image upload failed, creating user without image:',
            uploadErr,
          );
          this.submitUserWithImage(payload);
        },
      );
    } else {
      this.submitUserWithImage(payload);
    }
  }

  // Helper method to submit user after image upload
  submitUserWithImage(payload: any) {
    this.isLoading = true;
    this.userService.createUser(payload).subscribe(
      (res) => {
        this.isLoading = false;
        this.resetUserForm();
        this.createdEmail = payload.email;
        this.verificationPending = true;
        this.verifyForm = this.fb.group({
          email: [payload.email, [Validators.required, Validators.email]],
          code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
        });
        alert(
          res?.message ||
            'Account created. Enter verification code sent to your email.',
        );
      },
      (err) => {
        this.isLoading = false;
        console.error('Signup error:', err);
        alert(err?.error?.error || 'Failed to create account.');
      },
    );
  }

  // Verify OTP/code with backend
  verifyCode() {
    if (!this.verifyForm) return;
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      alert('Please enter the 6-digit verification code.');
      return;
    }

    const payload = {
      email: this.verifyForm.value.email,
      code: Number(this.verifyForm.value.code),
    };

    this.isLoading = true;
    this.userService.verifyUser(payload).subscribe(
      (res) => {
        this.isLoading = false;
        const verified = res?.data?.isVerified ?? true;
        alert(res?.message || 'Account verified successfully.');
        if (verified) {
          // reset all forms and state after successful verification
          this.resetAllForms();
          this.closeSignup();
        } else {
          alert('Verification did not mark the account as verified.');
        }
      },
      (err) => {
        this.isLoading = false;
        console.error('Verification error:', err);
        alert(err?.error?.error || 'Verification failed.');
      },
    );
  }

  // Reset only the signup form (keep verification flow intact)
  resetUserForm() {
    if (this.userForm) {
      this.userForm.reset();
    }
    this.submitted = false;
    this.profileFile = null;
    this.profilePreview = null;
  }

  // Reset verification form/state
  resetVerifyForm() {
    if (this.verifyForm) {
      this.verifyForm.reset();
    }
    this.verificationPending = false;
    this.createdEmail = null;
  }

  // Reset everything
  resetAllForms() {
    this.resetUserForm();
    this.resetVerifyForm();
  }

  //city select handler
  onCitySelected(event: any) {
    const cityId = event.target.value;
    const city = this.cities.find((c) => c.id == cityId);
    if (city) {
      this.userForm.patchValue({
        latitude: city.latitude,
        longitude: city.longitude,
      });
    }
  }
}
