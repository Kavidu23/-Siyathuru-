import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  // Base URL automatically switches for local or Docker
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/feedbacks'
    : 'http://backend:3000/api/feedbacks'; // backend service name in Docker

  constructor(private http: HttpClient) { }

  // POST feedback
  createFeedback(feedback: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, feedback);
  }

  // GET all feedbacks
  getFeedbacks(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

}
