import { Component, OnInit, OnDestroy } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CommunityService } from '../services/community.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [FooterComponent, CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  userData: any = null;

  joinedCommunities: any[] = [];
  upcomingEvents: any[] = [];
  alertsCount = 0;
  recommendedCommunities: any[] = [];

  isLoading = true;

  private subs: Subscription[] = [];

  constructor(
    private communityService: CommunityService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // 🔥 LISTEN TO AUTH STATE (same as navbar)
    const authSub = this.userService.authState$.subscribe((user) => {
      this.userData = user;

      if (!user) {
        this.router.navigate(['/home']);
        return;
      }

      // once user available → load communities
      this.loadCommunities();
    });

    this.subs.push(authSub);

    // also validate session on refresh
    const validateSub = this.userService.validateSession().subscribe({
      error: () => {
        this.router.navigate(['/home']);
      },
    });

    this.subs.push(validateSub);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // ===================== LOAD COMMUNITIES =====================

  loadCommunities(): void {
    if (!this.userData) return;

    this.isLoading = true;

    const sub = this.communityService.getAllCommunities().subscribe({
      next: (res: any) => {
        const all: any[] = res?.data || res || [];
        const userId = this.userData?._id;

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

        // ===== ALERTS =====
        this.alertsCount = this.joinedCommunities.reduce(
          (acc, c) => acc + (c?.pendingRequests?.length || 0),
          0,
        );

        // ===== RECOMMENDED =====
        this.recommendedCommunities = all
          .filter((c) => !this.joinedCommunities.some((j) => j._id === c._id))
          .slice(0, 4);
      },

      complete: () => {
        this.isLoading = false;
      },

      error: () => {
        this.isLoading = false;
      },
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
}
