import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private baseUrl = 'http://localhost:5000/api/feedbacks';

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
