import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PrivateCommunityService } from '../services/privateCommunity.service';
import { UserService } from '../services/user.service';

interface JoinRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  loading?: boolean;
  accepting?: boolean;
  requestedAt: string;
}

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css'],
})
export class ReviewComponent implements OnInit, OnDestroy {
  joinRequests: JoinRequest[] = [];
  communityId: string = '';

  isLoading = false;

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
        alert('No community selected for review.');
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

    this.privateCommunityService.getJoinRequests(this.communityId).subscribe({
      next: (response) => {
        if (response?.success) {
          this.joinRequests = response.joinRequests || [];
        } else {
          alert('Failed to load join requests.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading join requests:', err);
        alert(err?.error?.message || 'Failed to load join requests.');
        this.isLoading = false;
      },
    });
  }

  // ===================== ACCEPT =====================
  acceptRequest(req: JoinRequest): void {
    if (!this.communityId) return;
    if (req.loading) return;

    req.loading = true;
    req.accepting = true;

    this.privateCommunityService
      .handleJoinRequest(this.communityId, req.user._id, true)
      .pipe(
        finalize(() => {
          req.loading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.joinRequests = this.joinRequests.filter((item) => item.user._id !== req.user._id);
            alert('Request approved successfully! ');
          } else {
            alert('Failed to accept request ');
          }
        },
        error: (err) => {
          console.error('Error accepting request:', err);
          alert(err?.error?.message || 'Failed to accept request ');
        },
      });
  }

  // ===================== REJECT =====================
  rejectRequest(req: JoinRequest): void {
    if (!this.communityId) return;
    if (req.loading) return;

    req.loading = true;
    req.accepting = false;

    this.privateCommunityService
      .handleJoinRequest(this.communityId, req.user._id, false)
      .pipe(
        finalize(() => {
          req.loading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.joinRequests = this.joinRequests.filter((item) => item.user._id !== req.user._id);
            alert('Request rejected successfully! ');
          } else {
            alert('Failed to reject request ');
          }
        },
        error: (err) => {
          console.error('Error rejecting request:', err);
          alert(err?.error?.message || 'Failed to reject request ');
        },
      });
  }
}
