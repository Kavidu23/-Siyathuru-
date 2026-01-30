import { Component, OnInit, OnDestroy } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CommunityService } from '../services/community.service';
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
  isLoading = false;

  private subs: Subscription[] = [];

  constructor(
    private communityService: CommunityService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    if (this.userData) {
      this.loadCommunities();
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private loadUserData(): void {
    try {
      const stored = localStorage.getItem('user');
      this.userData = stored ? JSON.parse(stored) : null;
    } catch (err) {
      this.userData = null;
    }
  }

  loadCommunities(): void {
    this.isLoading = true;
    const sub = this.communityService.getAllCommunities().subscribe({
      next: (res: any) => {
        const all: any[] = res?.data || res || [];
        const userId = this.userData?._id;
        const userJoinedIds = (this.userData?.joinedCommunities || []).map(
          (c: any) => String(c),
        );

        // communities the user has joined or where the user is leader
        this.joinedCommunities = all.filter((c) => {
          // Check if user is leader
          const isLeader = c?.leader?._id === userId || c?.leader === userId;
          // Check if user is in members array
          const isMember = c?.members?.some(
            (m: any) =>
              m?._id === userId || m === userId || String(m) === userId,
          );
          // Check if community is in user's joinedCommunities array
          const inUserJoined = userJoinedIds.includes(String(c._id));
          return isLeader || isMember || inUserJoined;
        });

        // collect upcoming events for joined communities
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

        // basic alerts: pending requests across joined communities where user is admin
        this.alertsCount = this.joinedCommunities.reduce(
          (acc, c) => acc + (c?.pendingRequests?.length || 0),
          0,
        );

        // recommended: simple heuristic - communities not joined
        this.recommendedCommunities = all
          .filter((c) => !this.joinedCommunities.some((j) => j._id === c._id))
          .slice(0, 4);
      },
      error: () => {},
      complete: () => {
        this.isLoading = false;
      },
    });
    this.subs.push(sub);
  }

  getCommunitiesCount(): number {
    return this.joinedCommunities.length;
  }

  viewCommunity(id: string): void {
    if (!id) return;
    this.router.navigate(['/community', id]);
  }

  viewEvent(event: any): void {
    if (!event) return;
    // navigate to event page if route exists
    const eventId = event._id || event.id;
    this.router.navigate(['/events', eventId]);
  }

  navigateToCreateCommunity(): void {
    this.router.navigate(['/create-community']);
  }
}
