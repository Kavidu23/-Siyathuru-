import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HttpClientModule } from '@angular/common/http';
import { FooterComponent } from '../footer/footer.component';
import { CommunityService } from '../services/community.service';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '../services/modal.service';
import { PrivateCommunityService } from '../services/privateCommunity.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';
import { EventService } from '../services/event.service';
import { CommunityPhotoService } from '../services/community-photo.service';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
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
export class CommunityProfileComponent implements OnInit, OnDestroy {
  map!: L.Map;
  community: any = null;
  communityEvents: any[] = [];
  communityPhotos: any[] = [];
  upcomingEvents: any[] = [];
  selectedImage: string | null = null;

  user: any = null;

  isMember = false;
  isRequestPending = false;

  private subs: Subscription[] = [];

  constructor(
    private communityService: CommunityService,
    private privateCommunityService: PrivateCommunityService,
    private route: ActivatedRoute,
    private modalService: ModalService,
    private eventService: EventService,
    private communityPhotoService: CommunityPhotoService,
    private userService: UserService,
  ) {}

  // ================= INIT =================

  ngOnInit() {
    const communityId = this.route.snapshot.paramMap.get('id');
    if (!communityId) return;

    // 1. Listen to auth state
    const authSub = this.userService.authState$.subscribe((u) => {
      this.user = u;
      this.checkMembershipState();
    });

    this.subs.push(authSub);

    // 2. Validate session on refresh
    this.subs.push(this.userService.validateSession().subscribe());

    // 3. Load community
    this.communityService.getCommunityById(communityId).subscribe({
      next: (res) => {
        this.community = res.data;
        this.initMap();
        this.checkMembershipState();
        // Load photos after community is loaded
        this.loadCommunityPhotos(communityId);
      },
      error: (err) => console.error(err),
    });

    // 4. Load upcoming events
    this.loadUpcomingEvents(communityId);
  }

  // -------- EVENTS --------
  loadUpcomingEvents(communityId: string) {
    this.eventService.getAllEvents().subscribe({
      next: (res) => {
        const allEvents = res.data || [];
        const now = new Date();

        this.communityEvents = allEvents.filter(
          (ev) => this.getEventCommunityId(ev?.communityId) === String(communityId),
        );

        this.upcomingEvents = this.communityEvents.filter((ev) => {
          const dt = this.buildEventDateTime(ev.eventDate, ev.eventTime);
          return dt ? dt > now : false;
        });
      },
      error: () => console.log('Failed to load events'),
    });
  }

  private getEventCommunityId(communityRef: any): string {
    if (!communityRef) return '';
    if (typeof communityRef === 'string') return communityRef;
    return String(communityRef?._id || communityRef?.id || '');
  }

  private buildEventDateTime(eventDate: string, eventTime?: string): Date | null {
    if (!eventDate) return null;
    const date = new Date(eventDate);
    if (Number.isNaN(date.getTime())) return null;

    if (!eventTime) return date;

    const timeMatch = String(eventTime)
      .trim()
      .match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
    if (!timeMatch) return date;

    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const meridiem = timeMatch[3]?.toLowerCase();

    if (meridiem) {
      if (hours === 12) {
        hours = meridiem === 'am' ? 0 : 12;
      } else if (meridiem === 'pm') {
        hours += 12;
      }
    }

    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // ============ MEMBERSHIP STATE ============

  private checkMembershipState() {
    if (!this.user || !this.community) {
      this.isMember = false;
      this.isRequestPending = false;
      return;
    }

    const userId = String(this.user._id);

    // ---- MEMBER CHECK ----
    this.isMember = (this.community.members || []).some((m: any) => String(m?._id || m) === userId);

    // ---- REQUEST PENDING (PRIVATE) ----
    if (this.community.isPrivate && !this.isMember) {
      this.isRequestPending = (this.community.joinRequests || []).some(
        (r: any) => String(r.user?._id || r.user) === userId,
      );
    } else {
      this.isRequestPending = false;
    }
  }

  // ============ PUBLIC JOIN ============

  joinCommunity() {
    if (!this.user) {
      this.modalService.openLogin();
      return;
    }

    const communityId = this.community?._id;
    if (!communityId) return;

    this.communityService.joinCommunity(communityId, this.user._id).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          alert(res?.message || 'Could not join community');
          return;
        }

        if (res.data) {
          this.community = res.data;
        }

        // Update auth state user (not localStorage!)
        const updatedUser = {
          ...this.user,
          joinedCommunities: [...(this.user.joinedCommunities || []), communityId],
        };

        this.userService['authState'].next(updatedUser);

        this.checkMembershipState();
        alert(res.message || 'Joined community');
      },

      error: (err) => {
        alert(err?.error?.error || 'Failed to join community');
      },
    });
  }

  // ============ LEAVE ============

  leaveCommunity() {
    if (!this.user) {
      this.modalService.openLogin();
      return;
    }

    const communityId = this.community?._id;
    if (!communityId || !confirm('Are you sure you want to leave?')) return;

    this.communityService.leaveCommunity(communityId, this.user._id).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          alert(res?.message || 'Could not leave community');
          return;
        }

        if (res.data) {
          this.community = res.data;
        }

        // Update auth state
        const updatedUser = {
          ...this.user,
          joinedCommunities: (this.user.joinedCommunities || []).filter(
            (id: any) => String(id) !== String(communityId),
          ),
        };

        this.userService['authState'].next(updatedUser);

        this.checkMembershipState();
        alert(res.message || 'Left community');
      },

      error: () => alert('Failed to leave community'),
    });
  }

  // ============ PRIVATE REQUEST ============

  requestJoinCommunity() {
    if (!this.user) {
      this.modalService.openLogin();
      return;
    }

    this.privateCommunityService.sendJoinRequest(this.community._id).subscribe({
      next: (res: any) => {
        alert(res.message || 'Join request sent');

        this.isRequestPending = true;

        if (!this.community.joinRequests) this.community.joinRequests = [];

        this.community.joinRequests.push({
          user: this.user._id,
        });
      },

      error: (err) => alert(err?.error?.error || 'Failed to send join request'),
    });
  }

  cancelJoinRequest() {
    if (!this.user) return;

    this.privateCommunityService.cancelJoinRequest(this.community._id).subscribe({
      next: (res: any) => {
        alert(res.message || 'Join request cancelled');

        this.community.joinRequests = (this.community.joinRequests || []).filter(
          (r: any) => String(r.user?._id || r.user) !== String(this.user._id),
        );

        this.checkMembershipState();
      },
      error: () => alert('Failed to cancel join request'),
    });
  }

  // ============ MAP ============

  initMap() {
    if (this.map) this.map.remove();

    const lat = this.community?.location?.coordinates?.latitude || 7.8731;
    const lon = this.community?.location?.coordinates?.longitude || 80.7718;

    this.map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    if (this.community?.location?.coordinates) {
      L.marker([lat, lon]).addTo(this.map).bindPopup(`<b>${this.community.name} 🚩</b>`);
    }
  }

  loadCommunityPhotos(communityId: string) {
    if (!communityId) return;
    this.communityPhotoService.getPhotosByCommunity(communityId).subscribe({
      next: (res: any) => {
        this.communityPhotos = res.data || res || [];
      },
    });
  }

  // ============ IMAGE PREVIEW ============

  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }
}
