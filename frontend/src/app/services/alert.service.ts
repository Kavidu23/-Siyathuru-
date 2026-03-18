import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AlertPayload {
  communityId: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isActive: boolean;
}

export interface AlertResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  details?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/alerts'
    : 'http://backend:3000/api/alerts';

  constructor(private http: HttpClient) {}

  // Create a new alert
  createAlert(payload: AlertPayload): Observable<AlertResponse> {
    return this.http.post<AlertResponse>(this.baseUrl, payload, {
      withCredentials: true,
    });
  }

  // Get all alerts
  getAlerts(): Observable<AlertResponse> {
    return this.http.get<AlertResponse>(this.baseUrl, {
      withCredentials: true,
    });
  }

  // Get alert by ID
  getAlertById(alertId: string): Observable<AlertResponse> {
    return this.http.get<AlertResponse>(`${this.baseUrl}/${alertId}`, {
      withCredentials: true,
    });
  }

  // Update an alert
  updateAlert(alertId: string, payload: Partial<AlertPayload>): Observable<AlertResponse> {
    return this.http.put<AlertResponse>(`${this.baseUrl}/${alertId}`, payload, {
      withCredentials: true,
    });
  }

  // Delete an alert
  deleteAlert(alertId: string): Observable<AlertResponse> {
    return this.http.delete<AlertResponse>(`${this.baseUrl}/${alertId}`, {
      withCredentials: true,
    });
  }

  // Get alerts for communities joined by a specific user
  getAlertsByUserId(userId: string): Observable<AlertResponse> {
    return this.http.get<AlertResponse>(`${this.baseUrl}/user/${userId}`, {
      withCredentials: true,
    });
  }

  // Get all alerts
  getNumberOfAlerts(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/count`, {
      withCredentials: true,
    });
  }
}
