import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { FooterComponent } from '../footer/footer.component';
import { FeedbackService } from '../services/feedback.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-feedback-give',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FooterComponent],
  templateUrl: './feedback-give.component.html',
  styleUrl: './feedback-give.component.css',
})
export class FeedbackGiveComponent implements OnInit {
  submitted = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  currentUser: any = null;
  feedbackForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private userService: UserService,
    private router: Router,
  ) {
    this.feedbackForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.currentUser = user;
      return;
    }

    this.userService.validateSession().subscribe({
      next: (res: any) => {
        this.currentUser = res?.user || this.userService.getCurrentUser();

        if (!this.currentUser) {
          alert('You must be logged in to submit feedback.');
          setTimeout(() => this.router.navigate(['/home']), 100); // delay navigation
        }
      },
      error: () => {
        alert('Session expired. Please log in again.');
        setTimeout(() => this.router.navigate(['/home']), 100);
      },
    });
  }

  get f(): any {
    return this.feedbackForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    const user = this.currentUser || this.userService.getCurrentUser();
    const userId = user?._id || user?.id;
    const name = user?.name || user?.username || '';

    if (!userId || !name) {
      this.errorMessage = 'Only registered users can submit feedback.';
      return;
    }

    this.isLoading = true;
    this.feedbackService
      .createFeedback({
        userId,
        name,
        message: this.feedbackForm.value.message?.trim(),
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.successMessage = res?.message || 'Feedback submitted successfully.';
          this.feedbackForm.reset();
          this.submitted = false;
        },
        error: (err: any) => {
          this.errorMessage =
            err?.error?.message || err?.error?.error || 'Failed to submit feedback.';
        },
      });
  }
}
