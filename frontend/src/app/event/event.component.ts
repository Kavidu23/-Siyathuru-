import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService, EventPayload } from '../services/event.service';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
})
export class EventComponent {
  constructor(private eventService: EventService) {}

  // FORM MODEL
  form: EventPayload = {
    communityId: '', // YOU MUST SET THIS
    title: '',
    description: '',
    location: '',
    eventDate: '',
    eventTime: '',
    attendees: [],
  };

  message = '';
  isLoading = false;

  createEvent() {
    if (!this.form.title || !this.form.communityId) {
      alert('Title and Community are required');
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
        alert(this.message || 'Error creating event');
        this.isLoading = false;
      },
    });
  }

  resetForm() {
    this.form = {
      communityId: '',
      title: '',
      description: '',
      location: '',
      eventDate: '',
      eventTime: '',
      attendees: [],
    };
  }

  // Convert comma IDs → array
  setAttendees(value: string) {
    this.form.attendees = value
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v);
  }
}
