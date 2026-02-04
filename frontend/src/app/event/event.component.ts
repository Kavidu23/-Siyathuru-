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

    if (!this.form.eventTime) {
      alert('Event time is required');
      return;
    }

    this.isLoading = true;

    // 🔥 CONVERT 24H → AM/PM BEFORE SENDING
    const payload: EventPayload = {
      ...this.form,
      eventTime: this.convertToAmPm(this.form.eventTime),
    };

    this.eventService.createEvent(payload).subscribe({
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

  convertToAmPm(time24: string): string {
    // Example input: "18:04" or "06:04"
    const [hour, minute] = time24.split(':');

    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';

    h = h % 12;
    h = h ? h : 12; // if 0 → 12

    return `${h.toString().padStart(2, '0')}:${minute} ${ampm}`;
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
