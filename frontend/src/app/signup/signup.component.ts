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
  cities: any[] = [];

  profileFile: File | null = null;
  profilePreview: string | ArrayBuffer | null = null;

  subscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private http: HttpClient,
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

    // POST to backend API
    this.http.post<any>('http://localhost:3000/api/users', payload).subscribe(
      (res) => {
        this.isLoading = false;
        alert(res?.message || 'Account Created Successfully!');
        this.closeSignup();
      },
      (err) => {
        this.isLoading = false;
        console.error('Signup error:', err);
        alert(err?.error?.error || 'Failed to create account.');
      },
    );
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
