import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { EventService, EventPayload } from '../services/event.service';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
})
export class EventComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
  ) {}

  // FORM MODEL
  form: EventPayload = {
    communityId: '',
    title: '',
    description: '',
    location: '',
    eventDate: '',
    eventTime: '',
    attendees: [],
  };

  isLoading = false;

  // =============================

  ngOnInit(): void {
    // GET COMMUNITY ID FROM URL
    this.route.queryParams.subscribe((params) => {
      if (params['communityId']) {
        this.form.communityId = params['communityId'];
      }
    });
  }

  // =============================

  createEvent() {
    if (!this.form.communityId) {
      alert('Community ID missing! Open from community page.');
      return;
    }

    if (!this.form.title) {
      alert('Title is required');
      return;
    }

    this.isLoading = true;

    this.eventService.createEvent(this.form).subscribe({
      next: (res) => {
        alert('Event created successfully');
        this.resetForm();
        this.isLoading = false;
      },

      error: (err) => {
        console.log(err);
        alert(err?.error?.message || 'Error creating event');
        this.isLoading = false;
      },
    });
  }

  // =============================

  resetForm() {
    this.form = {
      communityId: this.form.communityId, // KEEP COMMUNITY ID
      title: '',
      description: '',
      location: '',
      eventDate: '',
      eventTime: '',
      attendees: [],
    };
  }
}
