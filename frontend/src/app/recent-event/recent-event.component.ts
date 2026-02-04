import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recent-event',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-event.component.html',
  styleUrls: ['./recent-event.component.css'],
})
export class RecentEventComponent implements OnInit {
  @Input() communityId!: string;

  recentEvents: any[] = [];
  isLoading = true;
  private subs: Subscription[] = [];

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    if (this.communityId) {
      this.loadRecentEvents(this.communityId);
    }
  }

  loadRecentEvents(communityId: string) {
    this.isLoading = true;
    const sub = this.eventService.getAllEvents().subscribe({
      next: (res: any) => {
        const allEvents = res.data || [];
        const now = new Date();

        // Filter past events for this community
        this.recentEvents = allEvents
          .filter((ev: any) => {
            if (ev.communityId !== communityId) return false;

            let eventDateTime = new Date(ev.eventDate);
            if (ev.eventTime) {
              let time = ev.eventTime.replace(' AM', '').replace(' PM', '');
              const isPM = ev.eventTime.includes('PM');
              let [h, m] = time.split(':');
              let hour = parseInt(h, 10);
              const minute = parseInt(m, 10);
              if (isPM && hour !== 12) hour += 12;
              if (!isPM && hour === 12) hour = 0;
              eventDateTime.setHours(hour, minute, 0, 0);
            }

            return eventDateTime <= now; // only past events
          })
          .sort(
            (
              a: { eventDate: string | number | Date },
              b: { eventDate: string | number | Date },
            ) =>
              new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
          );
      },
      error: (err) => console.error('Failed to load recent events', err),
      complete: () => (this.isLoading = false),
    });

    this.subs.push(sub);
  }

  viewCommunity(id: string) {
    if (!id) return;
    // Implement navigation if needed
    console.log('Go to community:', id);
  }
}
