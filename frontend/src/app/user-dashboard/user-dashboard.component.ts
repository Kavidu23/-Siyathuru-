import { Component, OnInit, OnDestroy } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { CommunityService } from '../services/community.service';
import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [FooterComponent, CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  userData: any = null;

  // ===== DATA =====
  joinedCommunities: any[] = [];
  alerts: any[] = [];
  events: any[] = [];
  upcomingEvents: any[] = [];
  recommendedCommunities: any[] = [];

  // ===== COUNTS =====
  alertsCount = 0;

  // ===== LOADING STATES =====
  isLoadingCommunities = false;
  isLoadingAlerts = false;

  private subs: Subscription[] = [];

  constructor(
    private communityService: CommunityService,
    private alertService: AlertService,
    private userService: UserService,
    private eventService: EventService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const authSub = this.userService.authState$.subscribe((user) => {
      this.userData = user;

      if (!user) {
        this.router.navigate(['/home']);
        return;
      }

      // YOU MISSED THIS CALL
      this.loadUserEvents();

      this.loadCommunities();
      this.loadAlerts();
    });

    this.subs.push(authSub);

    const validateSub = this.userService.validateSession().subscribe({
      error: () => this.router.navigate(['/home']),
    });

    this.subs.push(validateSub);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // ===================== LOAD COMMUNITIES =====================
  loadCommunities(): void {
    if (!this.userData) return;

    this.isLoadingCommunities = true;

    const sub = this.communityService.getAllCommunities().subscribe({
      next: (res: any) => {
        const all: any[] = res?.data || res || [];
        const userId = this.userData._id;

        const userJoinedIds = (this.userData?.joinedCommunities || []).map(
          (c: any) => String(c),
        );

        // ===== JOINED COMMUNITIES =====
        this.joinedCommunities = all.filter((c) => {
          const isLeader = c?.leader?._id === userId || c?.leader === userId;
          const isMember = c?.members?.some(
            (m: any) =>
              m?._id === userId || m === userId || String(m) === userId,
          );
          const inUserJoined = userJoinedIds.includes(String(c._id));
          return isLeader || isMember || inUserJoined;
        });

        this.joinedCommunities.forEach((c) => (c.isJoined = true));

        // ===== UPCOMING EVENTS =====
        const now = new Date();
        const in30Days = new Date();
        in30Days.setDate(now.getDate() + 30);

        this.upcomingEvents = [];

        this.joinedCommunities.forEach((c) => {
          const events = c?.events || c?.upcomingEvents || c?.eventsList || [];
          events.forEach((e: any) => {
            const date = e?.date ? new Date(e.date) : null;
            if (date && date > now && date <= in30Days) {
              this.upcomingEvents.push({
                ...e,
                communityName: c.name,
                communityId: c._id,
              });
            }
          });
        });

        // ===== RECOMMENDED COMMUNITIES =====
        this.recommendedCommunities = all
          .filter((c) => !this.joinedCommunities.some((j) => j._id === c._id))
          .slice(0, 4);
      },
      error: (err) => console.error('Failed to load communities', err),
      complete: () => (this.isLoadingCommunities = false),
    });

    this.subs.push(sub);
  }

  // ===================== LOAD ALERTS =====================
  loadAlerts(): void {
    // Ensure we have the user data and the ID exists
    if (!this.userData || !this.userData._id) return;

    this.isLoadingAlerts = true;
    const userId = this.userData._id;

    // Call the new specific backend method
    const sub = this.alertService.getAlertsByUserId(userId).subscribe({
      next: (res: any) => {
        // The backend now handles the filtering logic based on joined communities
        this.alerts = res?.data || [];
        this.alertsCount = this.alerts.length;
      },
      error: (err) => {
        console.error('Failed to load user-specific alerts', err);
        this.isLoadingAlerts = false; // Ensure loading stops on error
      },
      complete: () => (this.isLoadingAlerts = false),
    });

    this.subs.push(sub);
  }

  // ===================== HELPERS =====================
  getCommunitiesCount(): number {
    return this.joinedCommunities.length;
  }

  viewCommunity(id: string): void {
    if (!id) return;
    this.router.navigate(['/community', id]);
  }

  viewEvent(event: any): void {
    if (!event) return;
    const eventId = event._id || event.id;
    this.router.navigate(['/events', eventId]);
  }

  navigateToCreateCommunity(): void {
    this.router.navigate(['/create-community']);
  }

  loadUserEvents(): void {
    if (!this.userData) return;

    const sub = this.eventService
      .getEventsByUserId(this.userData._id)
      .subscribe({
        next: (res: any) => {
          // Ensure each attendee is an object with _id
          this.upcomingEvents = (res?.data || []).map((ev: any) => {
            ev.attendees =
              ev.attendees?.map((a: any) =>
                typeof a === 'string' ? { _id: a } : a,
              ) || [];
            return ev;
          });
        },
        error: (err) => console.error('Failed to load events', err),
      });

    this.subs.push(sub);
  }

  isUserJoinedEvent(ev: any): boolean {
    return ev.attendees?.some((a: any) => a._id === this.userData?._id);
  }

  joinEvent(ev: any): void {
    const userId = this.userData._id;

    // Already joined check
    const already = ev.attendees?.some((a: any) => a._id === userId);
    if (already) {
      alert('You have already joined this event');
      return;
    }

    const ok = confirm(
      'Once you join this event, you cannot change your RSVP. Continue?',
    );
    if (!ok) return;

    this.eventService.joinEvent(ev._id, userId).subscribe({
      next: (res: any) => {
        alert('Successfully joined event');

        // Update the event in-place immutably
        this.upcomingEvents = this.upcomingEvents.map((e) => {
          if (e._id === ev._id) {
            return {
              ...e,
              attendees: [
                ...(e.attendees || []),
                {
                  _id: userId,
                  name: this.userData.name,
                  email: this.userData.email,
                },
              ],
            };
          }
          return e;
        });
      },
      error: () => alert('Failed to join event'),
    });
  }
}
