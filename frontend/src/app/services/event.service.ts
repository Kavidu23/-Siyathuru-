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

  // ===================== CREATE =====================

  createEvent(data: EventPayload): Observable<any> {
    return this.http.post(this.baseUrl, data, { withCredentials: true });
  }

  // ===================== READ =====================

  getEvents(): Observable<{
    success: boolean;
    message: string;
    data: Event[];
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      data: Event[];
    }>(this.baseUrl, { withCredentials: true });
  }

  // Alias
  getAllEvents() {
    return this.getEvents();
  }

  getEventsByCommunityId(communityId: string): Observable<{
    success: boolean;
    message: string;
    count?: number;
    data: Event[];
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      count?: number;
      data: Event[];
    }>(`${this.baseUrl}/community/${communityId}`, { withCredentials: true });
  }

  getUpcomingEventsByCommunityId(communityId: string): Observable<{
    success: boolean;
    message: string;
    count?: number;
    data: Event[];
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      count?: number;
      data: Event[];
    }>(`${this.baseUrl}/community/${communityId}/upcoming`, { withCredentials: true });
  }

  getEventById(id: string): Observable<{
    success: boolean;
    data: Event;
  }> {
    return this.http.get<{
      success: boolean;
      data: Event;
    }>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  // ===================== UPDATE =====================

  updateEvent(
    id: string,
    data: Partial<Event>,
  ): Observable<{
    success: boolean;
    message: string;
    data: Event;
  }> {
    return this.http.put<{
      success: boolean;
      message: string;
      data: Event;
    }>(`${this.baseUrl}/${id}`, data, { withCredentials: true });
  }

  // ===================== DELETE =====================

  deleteEvent(id: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.delete<{
      success: boolean;
      message: string;
    }>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  joinEvent(eventId: string, userId: string) {
    return this.http.post(
      `${this.baseUrl}/join`,
      {
        eventId,
        userId,
      },
      { withCredentials: true },
    );
  }

  getEventsByUserId(userId: string): Observable<{
    success: boolean;
    count: number;
    data: Event[];
  }> {
    return this.http.get<{
      success: boolean;
      count: number;
      data: Event[];
    }>(`${this.baseUrl}/user/${userId}`, {
      withCredentials: true,
    });
  }

  // Get all alerts
  getNumberOfEvents(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/count`, {
      withCredentials: true,
    });
  }
}
