import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { CommunityService } from '../services/community.service';
import { UserService } from '../services/user.service';
import { EventService, Event } from '../services/event.service';
import { finalize } from 'rxjs/operators';
import { AlertService } from '../services/alert.service';
import { RecentEventComponent } from '../recent-event/recent-event.component';
import { ChatService } from '../services/chat.service';

interface Community {
  _id: string;
  name: string;
  leader: string;
  members: string[];
  profileImage?: string;
  isVerified?: boolean;
}

@Component({
  selector: 'app-community-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent, RecentEventComponent],
  templateUrl: './community-dashboard.component.html',
  styleUrls: ['./community-dashboard.component.css'],
})
export class CommunityDashboardComponent implements OnInit {
  currentUser: any;
  selectedCommunity: Community | null = null;
  upcomingEvents: Event[] = [];
  alerts: any[] = [];

  isLoading = true;
  isDeleting = false;
  isUpdatingAlert = false;
  isVerifying = false;
  errorMessage = '';

  totalMembers = 0;
  hasUnread = false;

  constructor(
    private communityService: CommunityService,
    private userService: UserService,
    private eventService: EventService,
    private alertService: AlertService,
    private chatService: ChatService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const communityId =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.queryParamMap.get('communityId');

    this.currentUser = this.userService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (communityId) {
      this.loadCommunityById(communityId);
    } else {
      this.loadDashboard();
    }

    this.chatService.hasUnread$.subscribe((hasUnread) => {
      this.hasUnread = hasUnread;
    });
  }

  loadDashboard() {
    this.communityService.getAllCommunities().subscribe({
      next: (response: any) => {
        const communities = response.data || response;
        const mine = communities.find(
          (c: Community) => c.leader === this.currentUser._id,
        );

        if (mine) {
          this.selectedCommunity = mine;
          this.totalMembers = mine.members?.length || 0;

          this.loadUpcomingEvents(mine._id);
          this.loadAlerts(mine._id);
        }

        this.isLoading = false;
      },

      error: () => {
        this.errorMessage = 'Failed to load community';
        this.isLoading = false;
      },
    });
  }

  loadCommunityById(communityId: string) {
    this.communityService.getCommunityById(communityId).subscribe({
      next: (res: any) => {
        this.selectedCommunity = res.data || res;
        this.totalMembers = this.selectedCommunity?.members?.length || 0;

        if (this.selectedCommunity?._id) {
          this.loadUpcomingEvents(this.selectedCommunity._id);
          this.loadAlerts(this.selectedCommunity._id);
        }

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load community';
        this.isLoading = false;
      },
    });
  }

  // -------- EVENTS --------
  loadUpcomingEvents(communityId: string) {
    this.eventService.getAllEvents().subscribe({
      next: (res) => {
        const allEvents = res.data || [];
        const now = new Date();

        this.upcomingEvents = allEvents
          .filter((ev) => ev.communityId === communityId)
          .filter((ev) => {
            const dt = this.buildEventDateTime(ev.eventDate, ev.eventTime);
            return dt ? dt > now : false;
          });
      },
      error: () => console.log('Failed to load events'),
    });
  }

  private buildEventDateTime(
    eventDate: string,
    eventTime?: string,
  ): Date | null {
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

  deleteEvent(id: string) {
    if (!confirm('Are you sure you want to remove this event?')) return;
    this.isDeleting = true;

    this.eventService
      .deleteEvent(id)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: (res) => {
          this.upcomingEvents = this.upcomingEvents.filter(
            (ev) => ev._id !== id,
          );
          alert(res.message || 'Event removed successfully');
        },
        error: (err) => alert(err?.error?.message || 'Failed to delete event'),
      });
  }

  // -------- ALERTS --------
  loadAlerts(communityId: string) {
    this.alertService.getAlertById(communityId).subscribe({
      next: (res) => {
        this.alerts = res.data || [];
      },
      error: () => console.log('Failed to load alerts'),
    });
  }

  toggleAlertStatus(alert: any) {
    if (!alert) return;

    const action = alert.isActive ? 'deactivate' : 'activate';
    const confirmMsg = `Are you sure you want to ${action} this alert?`;

    if (!confirm(confirmMsg)) return; // ✅ Show confirmation popup

    this.isUpdatingAlert = true;

    const payload = { isActive: !alert.isActive };

    this.alertService
      .updateAlert(alert._id, payload)
      .pipe(finalize(() => (this.isUpdatingAlert = false)))
      .subscribe({
        next: (res) => {
          // ✅ Update UI immediately
          alert.isActive = !alert.isActive;
          const status = alert.isActive ? 'activated' : 'deactivated';
          window.alert(`Alert ${status} successfully`);
        },
        error: () => window.alert('Failed to update alert'),
      });
  }

  deleteAlert(alert: any) {
    if (!alert?._id) return;

    if (!confirm('Are you sure you want to remove this alert?')) return;

    this.alertService
      .deleteAlert(alert._id)
      .subscribe({
        next: (res) => {
          this.alerts = this.alerts.filter((al) => al._id !== alert._id);
          window.alert(res.message || 'Alert removed successfully');
        },
        error: (err) =>
          window.alert(err?.error?.message || 'Failed to remove alert'),
      });
  }

  // -------- NAVIGATION --------
  goToRequests() {
    this.router.navigate(['/management'], {
      queryParams: {
        communityId: this.selectedCommunity?._id,
        view: 'requests',
      },
    });
  }

  goToCreateEvent() {
    this.router.navigate(['/management'], {
      queryParams: { communityId: this.selectedCommunity?._id, view: 'events' },
    });
  }

  goToAlert() {
    this.router.navigate(['/management'], {
      queryParams: { communityId: this.selectedCommunity?._id, view: 'alert' },
    });
  }

  goToGallery() {
    this.router.navigate(['/management'], {
      queryParams: {
        communityId: this.selectedCommunity?._id,
        view: 'gallery',
      },
    });
  }

  goToMembers() {
    this.router.navigate(['/members'], {
      queryParams: { communityId: this.selectedCommunity?._id },
    });
  }

  goToChat() {
    this.router.navigate(['/chatbox'], {
      queryParams: { communityId: this.selectedCommunity?._id },
    });
  }

  getLeaderName() {
    return this.currentUser?.name || 'Leader';
  }

  getCommunityName() {
    return this.selectedCommunity?.name || '';
  }

  alertButtonLabel(alert: any) {
    return alert.isActive ? 'Deactivate' : 'Activate';
  }

  requestVerification() {
    const communityId = this.selectedCommunity?._id;
    if (!communityId) return;

    if (this.selectedCommunity?.isVerified) {
      alert('Community is already verified');
      return;
    }

    this.isVerifying = true;
    this.communityService.verifyCommunity(communityId).subscribe({
      next: (res: any) => {
        this.isVerifying = false;
        if (this.selectedCommunity) {
          this.selectedCommunity.isVerified = true;
        }
        alert(res?.message || 'Verification requested successfully');
      },
      error: (err) => {
        this.isVerifying = false;
        alert(err?.error?.error || 'Verification request failed');
      },
    });
  }
}
