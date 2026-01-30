import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from '../footer/footer.component';
import { CommunityService } from '../services/community.service';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '../services/modal.service';

// Fix Leaflet default icon path for Angular
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-community-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, FooterComponent],
  templateUrl: './community-profile.component.html',
  styleUrls: ['./community-profile.component.css'],
})
export class CommunityProfileComponent implements AfterViewInit, OnInit {
  map!: L.Map;
  //hold the community
  community: any = null; // to store fetched community
  selectedImage: string | null = null;
  isMember = false;

  constructor(
    private http: HttpClient,
    private communityService: CommunityService,
    private route: ActivatedRoute,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    // Fetch the "id" from the route parameter
    const communityId = this.route.snapshot.paramMap.get('id');

    if (!communityId) {
      alert('Community can not be found');
      return;
    }

    this.communityService.getCommunityById(communityId).subscribe({
      next: (res) => {
        this.community = res.data;
        this.initMap();
        this.checkMembership();
      },

      error: (err) => {
        console.error('Failed to fetch community:', err);
      },
    });
  }

  private checkMembership() {
    try {
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      if (!user) {
        this.isMember = false;
        return;
      }
      this.isMember = (this.community?.members || []).some(
        (m: any) => m?._id === user._id || m === user._id,
      );
    } catch (err) {
      this.isMember = false;
    }
  }

  joinCommunity() {
    try {
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      if (!user) {
        // open login modal
        this.modalService.openLogin();
        return;
      }

      const communityId = this.community?._id;
      if (!communityId) return;

      this.communityService.joinCommunity(communityId, user._id).subscribe({
        next: (res: any) => {
          if (res?.success) {
            alert(res.message || 'Joined community');
            // update local UI state
            if (res.data) {
              this.community = res.data;
            } else if (!this.community.isPrivate) {
              // push the user locally if backend returned no data
              this.community.members = this.community.members || [];
              this.community.members.push(user._id);
            }
            this.checkMembership();
          } else {
            alert(res?.message || res?.error || 'Could not join community');
          }
        },
        error: (err: any) => {
          console.error('Join error', err);
          alert(err?.error?.error || 'Failed to join community');
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  leaveCommunity() {
    try {
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      if (!user) {
        this.modalService.openLogin();
        return;
      }

      const communityId = this.community?._id;
      if (!communityId) return;

      if (!confirm('Are you sure you want to leave this community?')) return;

      this.communityService.leaveCommunity(communityId, user._id).subscribe({
        next: (res: any) => {
          if (res?.success) {
            alert(res.message || 'Left community');
            if (res.data) {
              this.community = res.data;
            } else {
              // remove locally
              this.community.members = (this.community.members || []).filter(
                (m: any) => m?._id !== user._id && m !== user._id,
              );
            }
            this.checkMembership();
          } else {
            alert(res?.message || res?.error || 'Could not leave community');
          }
        },
        error: (err: any) => {
          console.error('Leave error', err);
          alert(err?.error?.error || 'Failed to leave community');
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  ngAfterViewInit(): void {}

  initMap() {
    if (this.map) {
      this.map.remove(); // destroy previous map instance
    }
    // Fallback: default to Sri Lanka center if coordinates not present
    const lat = this.community?.location?.coordinates?.latitude || 7.8731;
    const lon = this.community?.location?.coordinates?.longitude || 80.7718;

    this.map = L.map('map').setView([lat, lon], 13); // Zoom closer to marker
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.whenReady(() => {
      setTimeout(() => this.map.invalidateSize(), 500);
    });

    // Optional: add a marker with popup (if you have coordinates from community)
    if (this.community?.location?.coordinates) {
      const { latitude, longitude } = this.community.location.coordinates;
      L.marker([latitude, longitude])
        .addTo(this.map)
        .bindPopup(`<b>${this.community.name} 🚩</b>`)
        .openPopup();
    }
  }

  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }
}
