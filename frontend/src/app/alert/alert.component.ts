import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../services/alert.service';

interface AlertPayload {
  communityId: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isActive: boolean;
}

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnInit {
  form: AlertPayload = {
    communityId: '', // will set from query params
    title: '',
    message: '',
    severity: 'info',
    isActive: true,
  };

  isLoading = false;

  constructor(
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Get communityId from query parameters
    this.route.queryParams.subscribe((params) => {
      if (params['communityId']) {
        this.form.communityId = params['communityId'];
      } else {
        alert('No community selected!');
      }
    });
  }

  createAlert() {
    if (!this.form.title || !this.form.message || !this.form.communityId) {
      alert('Title, message and community are required!');
      return;
    }

    this.isLoading = true;

    this.alertService.createAlert(this.form).subscribe({
      next: (res) => {
        if (res?.success) {
          alert('Alert created successfully!');
          this.resetForm();
        } else {
          alert(res?.message || 'Failed to create alert ');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message || 'Failed to create alert ');
        this.isLoading = false;
      },
    });
  }

  resetForm() {
    this.form = {
      communityId: this.form.communityId, // keep current community
      title: '',
      message: '',
      severity: 'info',
      isActive: true,
    };
  }
}
