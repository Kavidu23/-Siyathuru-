import { Component, OnInit, OnDestroy } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { CommunityService } from '../services/community.service';
import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';
import { EventService } from '../services/event.service';
import { ChatService } from '../services/chat.service';

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
  upcomingEvents: any[] = [];
  recommendedCommunities: any[] = [];

  // ===== COUNTS =====
  alertsCount = 0;

  // ===== LOADING STATES =====
  isLoadingCommunities = false;
  isLoadingAlerts = false;
  hasUnread = false;

  private subs: Subscription[] = [];

  constructor(
    private communityService: CommunityService,
    private alertService: AlertService,
    private userService: UserService,
    private eventService: EventService,
    private chatService: ChatService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const authSub = this.userService.authState$.subscribe((user) => {
      this.userData = user;

      if (!user) {
        this.router.navigate(['/home']);
        return;
      }

      // LOAD ALL USER RELATED DATA
      this.loadUserEvents();
      this.loadCommunities();
      this.loadAlerts();
    });

    this.subs.push(authSub);

    const validateSub = this.userService.validateSession().subscribe({
      error: () => this.router.navigate(['/home']),
    });

    this.subs.push(validateSub);

    const unreadSub = this.chatService.hasUnread$.subscribe((hasUnread) => {
      this.hasUnread = hasUnread;
    });
    this.subs.push(unreadSub);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // LOAD COMMUNITIES
  loadCommunities(): void {
    if (!this.userData) return;

    this.isLoadingCommunities = true;

    const sub = this.communityService.getAllCommunities().subscribe({
      next: (res: any) => {
        const all: any[] = res?.data || res || [];
        const userId = this.userData._id;

        const userJoinedIds = (this.userData?.joinedCommunities || []).map((c: any) => String(c));

        // ===== JOINED COMMUNITIES =====
        this.joinedCommunities = all.filter((c) => {
          const isLeader = c?.leader?._id === userId || c?.leader === userId;

          const isMember = c?.members?.some(
            (m: any) => m?._id === userId || m === userId || String(m) === userId,
          );

          const inUserJoined = userJoinedIds.includes(String(c._id));

          return isLeader || isMember || inUserJoined;
        });

        this.joinedCommunities.forEach((c) => (c.isJoined = true));
      },
      error: (err) => console.error('Failed to load communities', err),
      complete: () => (this.isLoadingCommunities = false),
    });

    this.subs.push(sub);
  }

  // LOAD ALERTS
  loadAlerts(): void {
    if (!this.userData || !this.userData._id) return;

    this.isLoadingAlerts = true;

    const sub = this.alertService.getAlertsByUserId(this.userData._id).subscribe({
      next: (res: any) => {
        this.alerts = res?.data || [];
        this.alertsCount = this.alerts.length;
      },
      error: (err) => {
        console.error('Failed to load user alerts', err);
        this.isLoadingAlerts = false;
      },
      complete: () => (this.isLoadingAlerts = false),
    });

    this.subs.push(sub);
  }

  // LOAD USER EVENTS (CORRECT UPCOMING EVENTS)
  loadUserEvents(): void {
    if (!this.userData) return;

    const now = new Date();

    const sub = this.eventService.getEventsByUserId(this.userData._id).subscribe({
      next: (res: any) => {
        const allEvents = res?.data || [];

        this.upcomingEvents = allEvents
          .map((ev: any) => {
            // normalize attendees
            ev.attendees =
              ev.attendees?.map((a: any) => (typeof a === 'string' ? { _id: a } : a)) || [];
            return ev;
          })

          // FILTER FUTURE EVENTS
          .filter((ev: any) => {
            if (!ev.eventDate) return false;

            const eventDateTime = new Date(ev.eventDate);

            if (ev.eventTime) {
              let time = ev.eventTime;
              const isPM = time.includes('PM');

              time = time.replace(' AM', '').replace(' PM', '');

              const [h, m] = time.split(':');

              let hour = parseInt(h, 10);
              const minute = parseInt(m, 10);

              if (isPM && hour !== 12) hour += 12;
              if (!isPM && hour === 12) hour = 0;

              eventDateTime.setHours(hour, minute, 0, 0);
            }

            return eventDateTime > now;
          })

          // SORT ASCENDING
          .sort((a: any, b: any) => {
            let aTime = new Date(a.eventDate).getTime();
            let bTime = new Date(b.eventDate).getTime();

            // add time if exists
            if (a.eventTime) {
              const [ah, am] = this.parseTime(a.eventTime);
              aTime += ah * 3600 * 1000 + am * 60 * 1000;
            }
            if (b.eventTime) {
              const [bh, bm] = this.parseTime(b.eventTime);
              bTime += bh * 3600 * 1000 + bm * 60 * 1000;
            }

            return aTime - bTime;
          });
      },

      error: (err) => console.error('Failed to load events', err),
    });

    this.subs.push(sub);
  }

  // HELPER TO PARSE TIME
  parseTime(time: string): [number, number] {
    const isPM = time.includes('PM');
    time = time.replace(' AM', '').replace(' PM', '');
    const [h, m] = time.split(':');
    let hour = parseInt(h, 10);
    const minute = parseInt(m, 10);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    return [hour, minute];
  }

  // HELPERS
  getCommunitiesCount(): number {
    return this.joinedCommunities.length;
  }

  isUserJoinedEvent(ev: any): boolean {
    return ev.attendees?.some((a: any) => a._id === this.userData?._id);
  }

  joinEvent(ev: any): void {
    const userId = this.userData._id;

    const already = ev.attendees?.some((a: any) => a._id === userId);

    if (already) {
      alert('You have already joined this event');
      return;
    }

    const ok = confirm('Once you join this event, you cannot change your RSVP. Continue?');

    if (!ok) return;

    this.eventService.joinEvent(ev._id, userId).subscribe({
      next: () => {
        alert('Successfully joined event');

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

  viewCommunity(id: string): void {
    if (!id) return;
    this.router.navigate(['/community', id]);
  }
}
