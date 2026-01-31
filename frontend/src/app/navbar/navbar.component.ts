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
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userData: any = null;

  private authSub!: Subscription;

  constructor(
    private modalService: ModalService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // 🔥 CORE FIX – Reactive listener
    this.authSub = this.userService.authState$.subscribe((user) => {
      this.userData = user;
      this.isLoggedIn = !!user;
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
    // 1. Must be logged in
    if (!this.isLoggedIn || !this.userData) {
      return;
    }

    // 2. Role based navigation
    if (this.userData.role === 'leader') {
      this.router.navigate(['/community-dashboard']);
      return;
    }

    // 3. Normal user
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
