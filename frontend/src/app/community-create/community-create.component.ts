import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommunityService } from '../services/community.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from "../footer/footer.component";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-community-create',
  standalone: true,
  imports: [ReactiveFormsModule, FooterComponent, CommonModule],
  templateUrl: './community-create.component.html',
  styleUrls: ['./community-create.component.css']
})
export class CommunityCreateComponent {
  communityForm: FormGroup;

  // Banner & Logo
  bannerFile: File | null = null;
  profileFile: File | null = null;

  bannerPreview: string | null = null;
  profilePreview: string | null = null;


  isLoading = false;
  submitted = false;

  communityTypes = ['Youth', 'Charity', 'Sports', 'Environmental', 'Education', 'Women', 'City', 'Village', 'Volunteer', 'Others'];

  constructor(private fb: FormBuilder, private communityService: CommunityService) {
    this.communityForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      otherType: [''],
      mission: ['', Validators.maxLength(500)],
      description: ['', Validators.maxLength(1000)],
      address: ['', Validators.required],
      latitude: ['', [Validators.required, Validators.pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/)]],
      longitude: ['', [Validators.required, Validators.pattern(/^[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?|180(\.0+)?$/)]],
      contactName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      facebook: ['', Validators.pattern(/https?:\/\/(www\.)?facebook\.com\/.+/)],
      instagram: ['', Validators.pattern(/https?:\/\/(www\.)?instagram\.com\/.+/)],
      whatsapp: ['', Validators.pattern(/https?:\/\/wa\.me\/\d+/)],
      reddit: ['', Validators.pattern(/https?:\/\/(www\.)?reddit\.com\/user\/.+/)],
      isPrivate: [false]
    });
  }

  get f() {
    return this.communityForm.controls;
  }

  onBannerSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.bannerFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => this.bannerPreview = reader.result as string;
      reader.readAsDataURL(this.bannerFile);
    }
  }

  onProfileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.profileFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => this.profilePreview = reader.result as string;
      reader.readAsDataURL(this.profileFile);
    }
  }

  onSubmit() {
    this.submitted = true;

    // 1️⃣ Validate images
    if (!this.bannerFile || !this.profileFile) {
      alert('Banner and Profile images are required.');
      return;
    }

    // 2️⃣ Validate 'Others' type
    if (this.communityForm.value.type === 'Others' && !this.communityForm.value.otherType) {
      alert('Please specify your community type.');
      return;
    }

    // 3️⃣ Validate form
    if (this.communityForm.invalid) {
      alert('All required fields must be completed with correct details. Please check again.');
      return;
    }

    // 4️⃣ Show loading
    this.isLoading = true;

    // 4️⃣ Create FormData
    const formData = new FormData();   //work well with multipart data like file uploads
    formData.append('bannerImage', this.bannerFile);
    formData.append('profileImage', this.profileFile);

    // 5️⃣ Append basic fields
    formData.append('name', this.f['name'].value);
    formData.append('type', this.f['type'].value);
    if (this.f['type'].value === 'Others') {
      formData.append('otherType', this.f['otherType'].value);
    }

    if (this.f['mission'].value) formData.append('mission', this.f['mission'].value);
    if (this.f['description'].value) formData.append('description', this.f['description'].value);

    // 6️⃣ Append nested objects
    formData.append('contact', JSON.stringify({
      name: this.f['contactName'].value,
      phone: this.f['phone'].value,
      email: this.f['email'].value
    }));

    formData.append('media', JSON.stringify({
      facebook: this.f['facebook'].value || '',
      instagram: this.f['instagram'].value || '',
      whatsapp: this.f['whatsapp'].value || '',
      reddit: this.f['reddit'].value || ''
    }));

    formData.append('location', JSON.stringify({
      address: this.f['address'].value,
      coordinates: {
        latitude: parseFloat(this.f['latitude'].value),
        longitude: parseFloat(this.f['longitude'].value)
      }
    }));

    formData.append('isPrivate', this.f['isPrivate'].value);

    // 7️⃣ Submit form
    this.communityService.createCommunity(formData).subscribe({
      next: res => {
        alert('Community created successfully!');
        this.onReset();
        this.isLoading = false; // hide loading
      },
      error: err => {
        console.error(err);
        alert('Failed to create community. Check console for details.');
        this.isLoading = false; // hide loading
      }
    });
  }


  onReset() {
    this.submitted = false;
    this.communityForm.reset();
    this.bannerFile = null;
    this.profileFile = null;
    this.bannerPreview = null;
    this.profilePreview = null;
  }
}
