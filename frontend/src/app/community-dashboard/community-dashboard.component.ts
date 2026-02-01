import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { CommunityService } from '../services/community.service';
import { UserService } from '../services/user.service';
import { HttpClient } from '@angular/common/http';

interface Community {
  _id: string;
  name: string;
  leader: string;
  members: string[];
  joinRequests: any[];
  profileImage?: string;
  bannerImage?: string;
}

interface Event {
  _id: string;
  title: string;
  eventDate: Date;
  eventTime: string;
  location: string;
  attendees: string[];
  communityId: string;
}

interface JoinRequest {
  _id: string;
  userId: any;
  communityId: string;
  status: string;
  createdAt: Date;
}

interface Alert {
  _id: string;
  communityId: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isActive: boolean;
}

@Component({
  selector: 'app-community-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FooterComponent,
    RouterLink,
  ],
  templateUrl: './community-dashboard.component.html',
  styleUrl: './community-dashboard.component.css',
})
export class CommunityDashboardComponent implements OnInit {
  // User & Community Data
  currentUser: any;
  leaderCommunity: Community | null = null;
  leaderCommunities: Community[] = [];

  // Dashboard Stats
  pendingRequests: JoinRequest[] = [];
  upcomingEvents: Event[] = [];
  communityAlerts: Alert[] = [];

  // UI State
  isLoading = true;
  errorMessage = '';
  selectedCommunity: Community | null = null;

  // Stats for display
  totalMembers = 0;
  activeMembers = 0;
  bannedMembers = 0;
  engagementRate = 0;
  profileCompleteness = 0;
  upcomingEventsCount = 0;
  criticalAlertsCount = 0;

  constructor(
    private communityService: CommunityService,
    private userService: UserService,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.currentUser = this.userService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Load all communities for the current user as leader
    this.communityService.getAllCommunities().subscribe({
      next: (communities: Community[]) => {
        // Filter communities where current user is the leader
        this.leaderCommunities = communities.filter(
          (c) => c.leader === this.currentUser._id,
        );

        if (this.leaderCommunities.length > 0) {
          this.selectedCommunity = this.leaderCommunities[0];
          this.leaderCommunity = this.selectedCommunity;
          this.loadCommunitySpecificData();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading communities:', err);
        this.errorMessage = 'Failed to load community data';
        this.isLoading = false;
      },
    });
  }

  loadCommunitySpecificData() {
    if (!this.selectedCommunity) return;

    // Load pending join requests
    this.loadPendingRequests();

    // Load upcoming events
    this.loadUpcomingEvents();

    // Load community alerts
    this.loadCommunityAlerts();

    // Calculate stats
    this.calculateCommunityStats();
  }

  loadPendingRequests() {
    if (!this.selectedCommunity) return;

    const requestsUrl = window.location.hostname.includes('localhost')
      ? 'http://localhost:3000/api/requests'
      : 'http://backend:3000/api/requests';

    this.http.get<any[]>(requestsUrl).subscribe({
      next: (requests) => {
        this.pendingRequests = requests.filter(
          (req) =>
            req.communityId === this.selectedCommunity?._id &&
            req.status === 'pending',
        );
      },
      error: (err) => console.error('Error loading requests:', err),
    });
  }

  loadUpcomingEvents() {
    if (!this.selectedCommunity) return;

    const eventsUrl = window.location.hostname.includes('localhost')
      ? 'http://localhost:3000/api/events'
      : 'http://backend:3000/api/events';

    this.http.get<Event[]>(eventsUrl).subscribe({
      next: (events) => {
        const now = new Date();
        const thirtyDaysFromNow = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000,
        );

        this.upcomingEvents = events
          .filter(
            (event) =>
              event.communityId === this.selectedCommunity?._id &&
              new Date(event.eventDate) >= now &&
              new Date(event.eventDate) <= thirtyDaysFromNow,
          )
          .sort(
            (a, b) =>
              new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
          );

        this.upcomingEventsCount = this.upcomingEvents.length;
      },
      error: (err) => console.error('Error loading events:', err),
    });
  }

  loadCommunityAlerts() {
    if (!this.selectedCommunity) return;

    const alertsUrl = window.location.hostname.includes('localhost')
      ? 'http://localhost:3000/api/alerts'
      : 'http://backend:3000/api/alerts';

    this.http.get<Alert[]>(alertsUrl).subscribe({
      next: (alerts) => {
        this.communityAlerts = alerts.filter(
          (alert) =>
            alert.communityId === this.selectedCommunity?._id && alert.isActive,
        );
        this.criticalAlertsCount = this.communityAlerts.filter(
          (a) => a.severity === 'critical',
        ).length;
      },
      error: (err) => console.error('Error loading alerts:', err),
    });
  }

  calculateCommunityStats() {
    if (!this.selectedCommunity) return;

    this.totalMembers = this.selectedCommunity.members?.length || 0;
    this.activeMembers = Math.floor(this.totalMembers * 0.9); // Placeholder calculation
    this.bannedMembers = 0;

    // Calculate engagement rate (placeholder - can be enhanced with actual metrics)
    this.engagementRate = Math.floor(Math.random() * 40 + 60); // 60-100%

    // Calculate profile completeness
    this.profileCompleteness = this.calculateProfileCompleteness(
      this.selectedCommunity,
    );
  }

  calculateProfileCompleteness(community: Community): number {
    let completeness = 0;
    const fields = [
      'name',
      'description',
      'location',
      'contact',
      'media',
      'profileImage',
      'bannerImage',
    ];

    fields.forEach((field) => {
      if (community[field as keyof Community]) {
        completeness += 100 / fields.length;
      }
    });

    return Math.round(completeness);
  }

  // Action Methods
  approveRequest(requestId: string, userId: string) {
    const requestsUrl = window.location.hostname.includes('localhost')
      ? `http://localhost:3000/api/requests/${requestId}`
      : `http://backend:3000/api/requests/${requestId}`;

    this.http.put(requestsUrl, { status: 'approved' }).subscribe({
      next: () => {
        // Also add user to community members
        if (this.selectedCommunity) {
          this.selectedCommunity.members.push(userId);
          this.loadPendingRequests();
          this.calculateCommunityStats();
        }
      },
      error: (err) => console.error('Error approving request:', err),
    });
  }

  denyRequest(requestId: string) {
    const requestsUrl = window.location.hostname.includes('localhost')
      ? `http://localhost:3000/api/requests/${requestId}`
      : `http://backend:3000/api/requests/${requestId}`;

    this.http.put(requestsUrl, { status: 'denied' }).subscribe({
      next: () => {
        this.loadPendingRequests();
      },
      error: (err) => console.error('Error denying request:', err),
    });
  }

  sendEmergencyAlert() {
    if (!this.selectedCommunity) return;

    const alertMessage = prompt('Enter emergency alert message:');
    if (!alertMessage) return;

    const alertsUrl = window.location.hostname.includes('localhost')
      ? 'http://localhost:3000/api/alerts'
      : 'http://backend:3000/api/alerts';

    const alertPayload = {
      communityId: this.selectedCommunity._id,
      title: 'Emergency Alert',
      message: alertMessage,
      severity: 'critical',
      isActive: true,
    };

    this.http.post(alertsUrl, alertPayload).subscribe({
      next: () => {
        alert('Emergency alert sent successfully');
        this.loadCommunityAlerts();
      },
      error: (err) => {
        console.error('Error sending alert:', err);
        alert('Failed to send emergency alert');
      },
    });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return d.toLocaleDateString('en-US', options);
  }

  getCommunityLeaderName(): string {
    return this.currentUser?.name || 'Leader';
  }

  getCommunityName(): string {
    return this.selectedCommunity?.name || 'Community';
  }

  switchCommunity(community: Community) {
    this.selectedCommunity = community;
    this.loadCommunitySpecificData();
  }

  navigateToEditCommunity() {
    if (this.selectedCommunity) {
      this.router.navigate(['/community-profile', this.selectedCommunity._id]);
    }
  }

  navigateToCreateEvent() {
    if (this.selectedCommunity) {
      this.router.navigate(['/event-create'], {
        queryParams: { communityId: this.selectedCommunity._id },
      });
    }
  }

  navigateToMemberManagement() {
    if (this.selectedCommunity) {
      this.router.navigate(['/member-management'], {
        queryParams: { communityId: this.selectedCommunity._id },
      });
    }
  }
}
