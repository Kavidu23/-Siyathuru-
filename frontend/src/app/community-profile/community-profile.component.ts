import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HttpClientModule } from '@angular/common/http';
import { FooterComponent } from '../footer/footer.component';
import { CommunityService } from '../services/community.service';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '../services/modal.service';
import { PrivateCommunityService } from '../services/privateCommunity.service';

// Fix Leaflet icon issue
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
export class CommunityProfileComponent implements OnInit, AfterViewInit {
  map!: L.Map;
  community: any = null;
  selectedImage: string | null = null;

  isMember = false;
  isRequestPending = false;

  constructor(
    private communityService: CommunityService,
    private privateCommunityService: PrivateCommunityService,
    private route: ActivatedRoute,
    private modalService: ModalService,
  ) {}

  // INIT
  ngOnInit() {
    const communityId = this.route.snapshot.paramMap.get('id');
    if (!communityId) return;

    this.communityService.getCommunityById(communityId).subscribe({
      next: (res) => {
        this.community = res.data;
        this.initMap();
        this.checkMembershipState();
      },
      error: (err) => console.error(err),
    });
  }

  ngAfterViewInit(): void {}

  // MEMBERSHIP + REQUEST STATE
  private checkMembershipState() {
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : null;

    if (!user || !this.community) {
      this.isMember = false;
      this.isRequestPending = false;
      return;
    }

    const userId = String(user._id);

    // MEMBER
    this.isMember = (this.community.members || []).some(
      (m: any) => String(m?._id || m) === userId,
    );

    // REQUEST PENDING (PRIVATE ONLY)
    if (this.community.isPrivate && !this.isMember) {
      this.isRequestPending = (this.community.joinRequests || []).some(
        (r: any) => String(r.user?._id || r.user) === userId,
      );
    } else {
      this.isRequestPending = false;
    }
  }

  // PUBLIC COMMUNITY JOIN (ALREADY CORRECT)
  joinCommunity() {
    try {
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;

      if (!user) {
        this.modalService.openLogin();
        return;
      }

      const communityId = this.community?._id;
      if (!communityId) return;

      this.communityService.joinCommunity(communityId, user._id).subscribe({
        next: (res: any) => {
          if (!res?.success) {
            alert(res?.message || 'Could not join community');
            return;
          }

          // 1. Update Component State
          if (res.data) {
            this.community = res.data;
          } else if (!this.community.isPrivate) {
            this.community.members = [
              ...(this.community.members || []),
              user._id,
            ];
          }

          // 2. Update LocalStorage (using the 'user' we already parsed)
          user.joinedCommunities = user.joinedCommunities || [];
          const isAlreadyMember = user.joinedCommunities.some(
            (id: string) => String(id) === String(communityId),
          );

          if (!isAlreadyMember) {
            user.joinedCommunities.push(String(communityId));
            localStorage.setItem('user', JSON.stringify(user));
          }

          this.checkMembershipState();
          alert(res.message || 'Joined community');
        },
        error: (err) => {
          console.error('Join error', err);
          alert(err?.error?.error || 'Failed to join community');
        },
      });
    } catch (err) {
      console.error('Unexpected error in joinCommunity:', err);
    }
  }

  leaveCommunity() {
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : null;

    if (!user) {
      this.modalService.openLogin();
      return;
    }

    const communityId = this.community?._id;
    if (!communityId || !confirm('Are you sure you want to leave?')) return;

    this.communityService.leaveCommunity(communityId, user._id).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          alert(res?.message || 'Could not leave community');
          return;
        }

        // 1. Update Component State
        if (res.data) {
          this.community = res.data;
        } else {
          const userIdStr = String(user._id);
          this.community.members = (this.community.members || []).filter(
            (m: any) => String(m?._id || m) !== userIdStr,
          );
        }

        // 2. Update LocalStorage (using the 'user' object we already have)
        if (user.joinedCommunities) {
          const cidStr = String(communityId);
          user.joinedCommunities = user.joinedCommunities.filter(
            (id: any) => String(id) !== cidStr,
          );
          localStorage.setItem('user', JSON.stringify(user));
        }

        this.checkMembershipState();
        alert(res.message || 'Left community');
      },
      error: (err) => {
        console.error('Leave error', err);
        alert(err?.error?.error || 'Failed to leave community');
      },
    });
  }

  // PRIVATE COMMUNITY – SEND REQUEST
  requestJoinCommunity() {
    const stored = localStorage.getItem('user');
    if (!stored) {
      this.modalService.openLogin();
      return;
    }

    this.privateCommunityService.sendJoinRequest(this.community._id).subscribe({
      next: (res: any) => {
        alert(res.message || 'Join request sent');

        // FIX: Update local state immediately
        this.isRequestPending = true;

        // Optional: Push the user ID to the local list so checkMembershipState works if called
        const user = JSON.parse(stored);
        if (!this.community.joinRequests) this.community.joinRequests = [];
        this.community.joinRequests.push({ user: user._id });
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.error || 'Failed to send join request');
      },
    });
  }

  // PRIVATE COMMUNITY – CANCEL REQUEST
  cancelJoinRequest() {
    const stored = localStorage.getItem('user');
    if (!stored) return;

    const user = JSON.parse(stored);

    this.privateCommunityService
      .cancelJoinRequest(this.community._id)
      .subscribe({
        next: (res: any) => {
          alert(res.message || 'Join request cancelled');
          // Update community joinRequests locally
          this.community.joinRequests = (
            this.community.joinRequests || []
          ).filter(
            (r: any) => String(r.user?._id || r.user) !== String(user._id),
          );
          this.checkMembershipState();
        },
        error: () => alert('Failed to cancel join request'),
      });
  }

  // MAP
  initMap() {
    if (this.map) this.map.remove();

    const lat = this.community?.location?.coordinates?.latitude || 7.8731;
    const lon = this.community?.location?.coordinates?.longitude || 80.7718;

    this.map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    if (this.community?.location?.coordinates) {
      L.marker([lat, lon])
        .addTo(this.map)
        .bindPopup(`<b>${this.community.name} 🚩</b>`);
    }
  }

  // IMAGE PREVIEW
  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }
}
