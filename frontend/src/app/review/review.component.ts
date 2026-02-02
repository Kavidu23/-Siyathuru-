import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { PrivateCommunityService } from '../services/privateCommunity.service';
import { UserService } from '../services/user.service';

interface JoinRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css',
})
export class ReviewComponent implements OnInit, OnDestroy {
  joinRequests: JoinRequest[] = [];
  communityId: string = '';

  isLoading = false;
  errorMessage = '';

  private routeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private privateCommunityService: PrivateCommunityService,
    private userService: UserService,
  ) {}

  // ===================== LIFECYCLE =====================

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe((params) => {
      this.communityId = params['communityId'];

      if (this.communityId) {
        this.loadJoinRequests();
      } else {
        this.errorMessage = 'No community selected';
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  // ===================== LOAD REQUESTS =====================

  loadJoinRequests(): void {
    if (!this.communityId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.privateCommunityService.getJoinRequests(this.communityId).subscribe({
      next: (response) => {
        if (response?.success) {
          this.joinRequests = response.joinRequests || [];
        } else {
          this.errorMessage = response?.error || 'Failed to load join requests';
        }

        this.isLoading = false;
      },

      error: (err) => {
        console.error('Error loading join requests:', err);

        this.errorMessage =
          err?.error?.message || 'Failed to load join requests';

        this.isLoading = false;
      },
    });
  }

  // ===================== ACCEPT =====================

  acceptRequest(userId: string): void {
    if (!this.communityId) return;

    this.privateCommunityService
      .handleJoinRequest(this.communityId, userId, true)
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.joinRequests = this.joinRequests.filter(
              (req) => req.user._id !== userId,
            );
          } else {
            this.errorMessage = response?.error || 'Failed to accept request';
          }
        },

        error: (err) => {
          console.error('Error accepting request:', err);

          this.errorMessage = err?.error?.message || 'Failed to accept request';
        },
      });
  }

  // ===================== REJECT =====================

  rejectRequest(userId: string): void {
    if (!this.communityId) return;

    this.privateCommunityService
      .handleJoinRequest(this.communityId, userId, false)
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.joinRequests = this.joinRequests.filter(
              (req) => req.user._id !== userId,
            );
          } else {
            this.errorMessage = response?.error || 'Failed to reject request';
          }
        },

        error: (err) => {
          console.error('Error rejecting request:', err);

          this.errorMessage = err?.error?.message || 'Failed to reject request';
        },
      });
  }
}
