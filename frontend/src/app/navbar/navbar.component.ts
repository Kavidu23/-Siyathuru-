import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ModalService } from '../modal.service';
import { CommonModule } from '@angular/common';

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

  logout(): void {
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.userData = null;
    this.router.navigate(['/home']);
  }
}
