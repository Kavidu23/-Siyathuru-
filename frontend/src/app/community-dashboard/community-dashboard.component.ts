import { Component, OnInit, OnDestroy } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink, Router } from '@angular/router';
import { ChartDashboardComponent } from '../charts/charts.component';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../services/community.service';
import { Subscription } from 'rxjs';

interface Community {
  _id: string;
  name: string;
  type: string;
  bannerImage?: string;
  profileImage?: string;
  members?: any[];
  upcomingEvents?: any[];
  pendingRequests?: number;
  engagementRate?: number;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: string;
}

@Component({
  selector: 'app-community-dashboard',
  standalone: true,
  imports: [FooterComponent, RouterLink, CommonModule],
  templateUrl: './community-dashboard.component.html',
  styleUrl: './community-dashboard.component.css',
})
export class CommunityDashboardComponent implements OnInit, OnDestroy {
  userData: UserData | null = null;
  communities: Community[] = [];
  selectedCommunity: Community | null = null;
  isLoading = false;
  subscription!: Subscription;

  constructor(
    private communityService: CommunityService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadUserCommunities();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Load user data from localStorage
  loadUserData() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        this.userData = JSON.parse(userJson);
      } catch (err) {
        console.error('Error parsing user data:', err);
        this.router.navigate(['/home']);
      }
    } else {
      // No user logged in, redirect to home
      this.router.navigate(['/home']);
    }
  }

  // Load communities for the logged-in user
  loadUserCommunities() {
    this.isLoading = true;
    this.communityService.getAllCommunities().subscribe(
      (res: any[]) => {
        if (Array.isArray(res)) {
          // Filter communities where user is a member or admin
          this.communities = res.filter(
            (c) =>
              c.admin?._id === this.userData?._id ||
              c.members?.some((m: any) => m._id === this.userData?._id),
          );

          // If no communities found, show message
          if (this.communities.length === 0) {
            console.log('No communities found for this user');
          } else {
            // Select first community by default
            this.selectedCommunity = this.communities[0];
          }
        }
        this.isLoading = false;
      },
      (err) => {
        console.error('Error loading communities:', err);
        this.isLoading = false;
      },
    );
  }

  // Switch to a different community
  selectCommunity(community: Community) {
    this.selectedCommunity = community;
  }

  // Navigate to create community
  navigateToCreateCommunity() {
    this.router.navigate(['/create-community']);
  }

  // Navigate to view community details
  viewCommunity(communityId: string) {
    this.router.navigate(['/community', communityId]);
  }

  // Navigate to edit community
  editCommunity(communityId: string) {
    this.router.navigate(['/community', communityId, 'edit']);
  }

  // Get total members count
  getTotalMembers(): number {
    return this.selectedCommunity?.members?.length || 0;
  }

  // Get pending requests count
  getPendingRequests(): number {
    return this.selectedCommunity?.pendingRequests || 0;
  }

  // Get upcoming events
  getUpcomingEvents(): any[] {
    return this.selectedCommunity?.upcomingEvents || [];
  }
}
