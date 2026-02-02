import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { CommunityService } from '../services/community.service';
import { UserService } from '../services/user.service';

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

  isLoading = true;
  errorMessage = '';

  totalMembers = 0;

  constructor(
    private communityService: CommunityService,
    private userService: UserService,
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
