import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { CommunityService } from '../services/community.service';
import { UserService } from '../services/user.service';
import { EventService, Event } from '../services/event.service';

interface Community {
  _id: string;
  name: string;
  leader: string;
  members: string[];
  profileImage?: string;
}

@Component({
  selector: 'app-community-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './community-dashboard.component.html',
  styleUrl: './community-dashboard.component.css',
})
export class CommunityDashboardComponent implements OnInit {
  currentUser: any;
  selectedCommunity: Community | null = null;
  upcomingEvents: Event[] = [];

  isLoading = true;
  errorMessage = '';

  totalMembers = 0;

  constructor(
    private communityService: CommunityService,
    private userService: UserService,
    private eventService: EventService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.currentUser = this.userService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.communityService.getAllCommunities().subscribe({
      next: (response: any) => {
        // 👉 Get community where logged user is leader
        const communities = response.data || response;
        const mine = communities.find(
          (c: Community) => c.leader === this.currentUser._id,
        );

        if (mine) {
          this.selectedCommunity = mine;
          this.totalMembers = mine.members?.length || 0;

          // 👉 NEW
          this.loadUpcomingEvents(mine._id);
        }

        this.isLoading = false;
      },

      error: () => {
        this.errorMessage = 'Failed to load community';
        this.isLoading = false;
      },
    });
  }

  // -------- NAVIGATION --------
  loadUpcomingEvents(communityId: string) {
    this.eventService.getAllEvents().subscribe({
      next: (res) => {
        const allEvents = res.data || [];

        const now = new Date();

        this.upcomingEvents = allEvents.filter((ev) => {
          // 1️⃣ Match community
          if (ev.communityId !== communityId) return false;

          // 2️⃣ Build real datetime from eventDate + eventTime
          // Extract date part from ISO string and combine with time
          const eventDateStr = ev.eventDate.split('T')[0];
          const eventDateTime = new Date(eventDateStr + 'T' + ev.eventTime);

          // 3️⃣ Only future
          return eventDateTime >= now;
        });
      },

      error: () => {
        console.log('Failed to load events');
      },
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

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return date;
    }

    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  goToRequests() {
    this.router.navigate(['/management'], {
      queryParams: { communityId: this.selectedCommunity?._id },
    });
  }

  goToCreateEvent() {
    this.router.navigate(['/event-create'], {
      queryParams: { communityId: this.selectedCommunity?._id },
    });
  }

  goToAlert() {
    this.router.navigate(['/management'], {
      queryParams: { communityId: this.selectedCommunity?._id },
    });
  }

  goToMembers() {
    this.router.navigate(['/member-management'], {
      queryParams: { communityId: this.selectedCommunity?._id },
    });
  }

  getLeaderName() {
    return this.currentUser?.name || 'Leader';
  }

  getCommunityName() {
    return this.selectedCommunity?.name || '';
  }
}
