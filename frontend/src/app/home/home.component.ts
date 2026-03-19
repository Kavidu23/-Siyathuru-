import { Component, OnInit, OnDestroy } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { ModalService } from '../services/modal.service';
import { FeedbackService } from '../services/feedback.service';
import { UserService } from '../services/user.service';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgForOf, NgIf, FooterComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  feedbacks: any[] = [];
  loading = true;
  errorMessage = '';

  // 🔥 Reactive login state
  isLoggedIn = false;

  private authSub!: Subscription;

  constructor(
    private modalService: ModalService,
    private feedbackService: FeedbackService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    // 1. Load feedbacks
    this.loadFeedbacks();

    // 2. Listen to login/logout changes
    this.authSub = this.userService.authState$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  // ============== FEEDBACK =================

  loadFeedbacks() {
    this.feedbackService.getFeedbacks().subscribe(
      (res) => {
        const allFeedbacks = Array.isArray(res?.data) ? res.data : [];
        this.feedbacks = allFeedbacks
          .sort(
            (a: any, b: any) =>
              new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime(),
          )
          .slice(0, 4);
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load feedbacks';
        this.loading = false;
      },
    );
  }

  // ============== MODALS =================

  openLoginModal() {
    this.modalService.openLogin();
  }

  openSignupModal() {
    this.modalService.openSignup();
  }

  // ============== OTHER =================

  openvid() {
    window.open('https://youtu.be/idyCXAGOJ2k', '_blank');
  }
}
