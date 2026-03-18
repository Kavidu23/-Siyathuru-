import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  // Base URL automatically switches for local or Docker
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/feedbacks'
    : 'http://backend:3000/api/feedbacks'; // backend service name in Docker

  constructor(private http: HttpClient) {}

  // POST feedback
  createFeedback(feedback: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, feedback);
  }

  // GET all feedbacks
  getFeedbacks(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  //Get number of feedbacks
  getNumberOfFeedbacks(): Observable<{ count: number }> {
    return this.http
      .get<{ count?: number; data?: { count?: number } }>(`${this.baseUrl}/count`)
      .pipe(
        map((response) => ({
          count: response.count ?? response.data?.count ?? 0,
        })),
      );
  }
}
