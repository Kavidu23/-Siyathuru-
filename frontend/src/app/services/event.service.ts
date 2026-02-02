import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Event {
  _id: string;
  communityId: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  eventTime: string;
  bannerImage?: string;
  attendees: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventPayload {
  communityId: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  eventTime: string;
  bannerImage?: string;
  attendees: string[];
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/events'
    : 'http://backend:3000/api/events';

  constructor(private http: HttpClient) {}

  createEvent(data: EventPayload): Observable<any> {
    return this.http.post(this.baseUrl, data, { withCredentials: true });
  }

  getEvents(): Observable<{
    success: boolean;
    message: string;
    data: Event[];
  }> {
    return this.http.get<{ success: boolean; message: string; data: Event[] }>(
      this.baseUrl,
      { withCredentials: true },
    );
  }

  getAllEvents(): Observable<{
    success: boolean;
    message: string;
    data: Event[];
  }> {
    return this.getEvents();
  }

  getEventById(id: string): Observable<{ success: boolean; data: Event }> {
    return this.http.get<{ success: boolean; data: Event }>(
      `${this.baseUrl}/${id}`,
      { withCredentials: true },
    );
  }

  updateEvent(
    id: string,
    data: Partial<Event>,
  ): Observable<{ success: boolean; message: string; data: Event }> {
    return this.http.put<{ success: boolean; message: string; data: Event }>(
      `${this.baseUrl}/${id}`,
      data,
      { withCredentials: true },
    );
  }

  deleteEvent(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${id}`,
      { withCredentials: true },
    );
  }
}
