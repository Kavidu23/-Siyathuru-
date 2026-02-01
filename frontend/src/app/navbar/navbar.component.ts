import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ModalService } from '../services/modal.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
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

  private authSub!: Subscription;

  constructor(
    private modalService: ModalService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // 🔥 Listen to auth changes
    this.authSub = this.userService.authState$.subscribe((user) => {
      this.userData = user;
      this.isLoggedIn = !!user;
      this.isLoading = false; // session validated
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
