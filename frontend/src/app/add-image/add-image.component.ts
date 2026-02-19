import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunityPhotoService, CommunityPhoto } from '../services/community-photo.service';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-image',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-image.component.html',
  styleUrl: './add-image.component.css',
})
export class AddImageComponent implements OnInit {
  communityId!: string;

  photos: CommunityPhoto[] = [];
  selectedFile: File | null = null;
  caption = '';

  isUploading = false;
  isLoading = false;

  constructor(
    private photoService: CommunityPhotoService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.communityId = params.get('communityId') || '';

      if (!this.communityId) {
        alert('Community ID not found');
        return;
      }

      this.loadPhotos();
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    // OPTIONAL BASIC VALIDATION
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    this.selectedFile = file;
  }

  uploadPhoto() {
    if (!this.selectedFile) {
      alert('Please select a photo first');
      return;
    }

    if (!this.communityId) {
      alert('Invalid community');
      return;
    }

    this.isUploading = true;

    this.photoService
      .uploadPhoto(this.communityId, this.selectedFile, this.caption)
      .pipe(finalize(() => (this.isUploading = false)))
      .subscribe({
        next: (photo: any) => {
          // Some APIs return { data: photo }
          const newPhoto = photo.data || photo;

          this.photos.unshift(newPhoto);

          this.selectedFile = null;
          this.caption = '';

          alert('Photo uploaded successfully');
        },

        error: (err) => {
          console.error(err);

          const msg = err?.error?.error || err?.error?.message || 'Failed to upload photo';

          alert(msg);
        },
      });
  }

  loadPhotos() {
    this.isLoading = true;

    this.photoService
      .getPhotosByCommunity(this.communityId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          // handle both raw array or { data: [] }
          this.photos = (res.data || res || []).reverse();
        },

        error: (err) => {
          console.error(err);
        },
      });
  }

  deletePhoto(photoId: string) {
    const ok = confirm('Are you sure you want to delete this photo?');
    if (!ok) return;

    this.photoService.deletePhoto(photoId).subscribe({
      next: (res: any) => {
        this.photos = this.photos.filter((p) => p._id !== photoId);

        alert(res?.message || 'Photo deleted successfully');
      },

      error: (err) => {
        console.error(err);
      },
    });
  }
}
