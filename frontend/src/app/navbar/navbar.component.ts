import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ModalService } from '../services/modal.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { ChatService } from '../services/chat.service';
import { CommunityService } from '../services/community.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'], // ✅ fixed typo
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userData: any = null;
  isLoading = true; // optional: for page reload
  hasUnread = false;

  private authSub!: Subscription;
  private unreadSub!: Subscription;
  private unreadUnsub: (() => void) | null = null;
  private communitiesSub?: Subscription;

  constructor(
    private modalService: ModalService,
    private userService: UserService,
    private chatService: ChatService,
    private communityService: CommunityService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // 🔥 Listen to auth changes
    this.authSub = this.userService.authState$.subscribe((user) => {
      this.userData = user;
      this.isLoggedIn = !!user;
      this.isLoading = false; // session validated

      if (user?._id) {
        this.loadChatUnread(user._id);
      } else {
        this.unreadUnsub?.();
        this.unreadUnsub = null;
        this.hasUnread = false;
      }
    });

    this.unreadSub = this.chatService.hasUnread$.subscribe((hasUnread) => {
      this.hasUnread = hasUnread;
    });

    // ✅ Validate session on page reload
    this.userService.validateSession().subscribe({
      next: () => {
        // authState$ already updated by validateSession()
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
    this.unreadUnsub?.();
    this.communitiesSub?.unsubscribe();
  }

  private loadChatUnread(userId: string) {
    this.communitiesSub?.unsubscribe();

    this.communitiesSub = this.communityService.getAllCommunities().subscribe({
      next: (res: any) => {
        const all: any[] = res?.data || res || [];
        const userJoinedIds = (this.userData?.joinedCommunities || []).map(
          (c: any) => String(c),
        );

        const communities = all.filter((c) => {
          const isLeader = c?.leader?._id === userId || c?.leader === userId;
          const isMember = c?.members?.some(
            (m: any) =>
              m?._id === userId || m === userId || String(m) === userId,
          );
          const inUserJoined = userJoinedIds.includes(String(c._id));
          return isLeader || isMember || inUserJoined;
        });

        const communityIds = communities.map((c) => c._id).filter(Boolean);

        this.unreadUnsub?.();
        this.unreadUnsub = this.chatService.startUnreadListenerForCommunities(
          userId,
          communityIds,
        );
      },
      error: () => {
        this.unreadUnsub?.();
        this.unreadUnsub = null;
        this.hasUnread = false;
      },
    });
  }

  openLoginModal() {
    this.modalService.openLogin();
  }

  openSignupModal() {
    this.modalService.openSignup();
  }

  goToUserDashboard(): void {
    if (!this.isLoggedIn || !this.userData) {
      return;
    }

    // Role-based navigation
    if (this.userData.role === 'leader') {
      this.router.navigate(['/community-dashboard']);
      return;
    }

    if (this.userData.role === 'admin') {
      this.router.navigate(['/superadmin']);
      return;
    }

    this.router.navigate(['/user-dashboard']);
  }

  logout(): void {
    this.userService.logoutUser().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => console.error('Logout failed', err),
    });
  }
}
