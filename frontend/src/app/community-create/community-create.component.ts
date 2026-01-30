import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommunityService } from '../services/community.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import imageCompression from 'browser-image-compression';
import { Router } from '@angular/router';

@Component({
  selector: 'app-community-create',
  standalone: true,
  imports: [ReactiveFormsModule, FooterComponent, CommonModule],
  templateUrl: './community-create.component.html',
  styleUrls: ['./community-create.component.css'],
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
  isBannerUploading = false;
  isProfileUploading = false;

  communityTypes = [
    'Youth',
    'Charity',
    'Sports',
    'Environmental',
    'Education',
    'Women',
    'City',
    'Village',
    'Volunteer',
    'Others',
  ];

  constructor(
    private fb: FormBuilder,
    private communityService: CommunityService,
    private router: Router,
  ) {
    this.communityForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      otherType: [''],
      mission: ['', Validators.maxLength(500)],
      description: ['', Validators.maxLength(1000)],
      address: ['', Validators.required],
      latitude: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/),
        ],
      ],
      longitude: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?|180(\.0+)?$/,
          ),
        ],
      ],
      contactName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      facebook: [
        '',
        Validators.pattern(/https?:\/\/(www\.)?facebook\.com\/.+/),
      ],
      instagram: [
        '',
        Validators.pattern(/https?:\/\/(www\.)?instagram\.com\/.+/),
      ],
      whatsapp: ['', Validators.pattern(/https?:\/\/wa\.me\/\d+/)],
      reddit: [
        '',
        Validators.pattern(/https?:\/\/(www\.)?reddit\.com\/user\/.+/),
      ],
      isPrivate: [false],
    });
  }

  get f() {
    return this.communityForm.controls;
  }

  async onBannerSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const options = {
        maxSizeMB: 4,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      // Disable input
      this.isBannerUploading = true;

      try {
        this.bannerFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onload = () => (this.bannerPreview = reader.result as string);
        reader.readAsDataURL(this.bannerFile);
        this.isBannerUploading = false;
      } catch (error) {
        console.error('Error compressing banner:', error);
        this.isBannerUploading = false;
      }
    }
  }

  async onProfileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      this.isProfileUploading = true;

      try {
        this.profileFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onload = () => (this.profilePreview = reader.result as string);
        reader.readAsDataURL(this.profileFile);
        this.isProfileUploading = false;
      } catch (error) {
        console.error('Error compressing profile:', error);
        this.isProfileUploading = false;
      }
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.communityForm.value.otherType) {
      this.communityForm.value.type = this.communityForm.value.otherType;
    }

    // 1️⃣ Validate images
    if (!this.bannerFile || !this.profileFile) {
      alert('Banner and Profile images are required.');
      return;
    }

    // 2️⃣ Validate 'Others' type
    if (
      this.communityForm.value.type === 'Others' &&
      !this.communityForm.value.otherType
    ) {
      alert('Please specify your community type.');
      return;
    }

    if (this.communityForm.invalid) {
      this.communityForm.markAllAsTouched(); // ensures all errors show
      return;
    }

    // 3️⃣ Show loading
    this.isLoading = true;

    // 4️⃣ Upload images to Cloudinary, then create community
    this.uploadCommunityCoverImages();
  }

  // Upload both banner and profile images to Cloudinary
  uploadCommunityCoverImages() {
    let bannerUrl: string | null = null;
    let profileUrl: string | null = null;
    let uploadCount = 0;

    // Upload banner
    this.communityService.uploadCommunityImage(this.bannerFile!).subscribe(
      (res) => {
        bannerUrl = res.data?.url || res.url;
        uploadCount++;
        if (uploadCount === 2) {
          this.submitCommunityWithImages(bannerUrl, profileUrl);
        }
      },
      (err) => {
        console.warn(
          'Banner upload failed, creating community without banner:',
          err,
        );
        uploadCount++;
        if (uploadCount === 2) {
          this.submitCommunityWithImages(bannerUrl, profileUrl);
        }
      },
    );

    // Upload profile
    this.communityService.uploadCommunityImage(this.profileFile!).subscribe(
      (res) => {
        profileUrl = res.data?.url || res.url;
        uploadCount++;
        if (uploadCount === 2) {
          this.submitCommunityWithImages(bannerUrl, profileUrl);
        }
      },
      (err) => {
        console.warn(
          'Profile upload failed, creating community without profile:',
          err,
        );
        uploadCount++;
        if (uploadCount === 2) {
          this.submitCommunityWithImages(bannerUrl, profileUrl);
        }
      },
    );
  }

  // Submit community with uploaded image URLs
  submitCommunityWithImages(
    bannerUrl: string | null,
    profileUrl: string | null,
  ) {
    // Create payload with image URLs
    const payload: any = {
      name: this.f['name'].value,
      type: this.f['type'].value,
      mission: this.f['mission'].value || '',
      description: this.f['description'].value || '',
      contact: {
        name: this.f['contactName'].value,
        phone: this.f['phone'].value,
        email: this.f['email'].value,
      },
      media: {
        facebook: this.f['facebook'].value || '',
        instagram: this.f['instagram'].value || '',
        whatsapp: this.f['whatsapp'].value || '',
        reddit: this.f['reddit'].value || '',
      },
      location: {
        address: this.f['address'].value,
        coordinates: {
          latitude: Number(this.f['latitude'].value),
          longitude: Number(this.f['longitude'].value),
        },
      },
      isPrivate: this.f['isPrivate'].value,
    };

    // Add type if 'Others'
    if (this.f['type'].value === 'Others') {
      payload.otherType = this.f['otherType'].value;
    }

    // Add image URLs if available
    if (bannerUrl) {
      payload.bannerImage = bannerUrl;
    }
    if (profileUrl) {
      payload.profileImage = profileUrl;
    }

    // Submit community with image URLs
    this.communityService.createCommunityWithPayload(payload).subscribe({
      next: (res) => {
        alert('Community created successfully!');
        this.onReset();
        this.isLoading = false;
        const communityId = res.data._id;
        this.router.navigate(['/community', communityId]);
      },
      error: (err) => {
        this.isLoading = false;

        if (err.error?.message === 'Duplicate field value') {
          alert('These details have been registered before');
          console.error(err);
          return;
        }

        console.error(err);
        alert('Failed to create community. Check console for details.');
      },
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
