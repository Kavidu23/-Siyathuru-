import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ModalService } from '../services/modal.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userData: any = null;

  constructor(
    private modalService: ModalService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.checkUserLogin();
    // Listen for storage changes (e.g., from other tabs)
    window.addEventListener('storage', () => this.checkUserLogin());
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', () => this.checkUserLogin());
  }

  private checkUserLogin(): void {
    try {
      const stored = localStorage.getItem('user');
      this.userData = stored ? JSON.parse(stored) : null;
      this.isLoggedIn = !!this.userData;
    } catch (err) {
      this.userData = null;
      this.isLoggedIn = false;
    }
  }

  openLoginModal() {
    this.modalService.openLogin();
  }

  openSignupModal() {
    this.modalService.openSignup();
  }

  goToUserDashboard(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/user-dashboard']);
    }
  }

  /* LOGOUT - Angular */
  logout(): void {
    // 1. Tell the server to clear the cookie
    this.userService.logoutUser().subscribe({
      next: () => {
        // 2. Clean up local state after server confirms
        localStorage.removeItem('user');
        this.isLoggedIn = false;
        this.userData = null;

        // 3. Redirect
        this.router.navigate(['/home']);
        alert('Logged out successfully');
      },
      error: (err) => {
        console.error('Logout failed', err);
        // Optional: Clear local data anyway even if server call fails
      },
    });
  }
}
