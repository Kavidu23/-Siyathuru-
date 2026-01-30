import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { ModalService } from '../services/modal.service';
import { FeedbackService } from '../services/feedback.service';
import { CommonModule, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgForOf, NgIf, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  feedbacks: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private modalService: ModalService,
    private feedbackService: FeedbackService,
  ) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks() {
    this.feedbackService.getFeedbacks().subscribe(
      (res) => {
        this.feedbacks = res.data; // backend returns { success: true, data: [...] }
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load feedbacks';
        this.loading = false;
      },
    );
  }

  openLoginModal() {
    this.modalService.openLogin();
  }

  openSignupModal() {
    this.modalService.openSignup();
  }

  openvid() {
    window.open('https://youtu.be/idyCXAGOJ2k', '_blank');
  }
}
