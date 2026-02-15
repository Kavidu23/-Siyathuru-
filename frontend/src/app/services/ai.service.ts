import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AskAIRequest {
  message: string;
}

export interface AskAIResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/ai'
    : 'http://backend:3000/api/ai';

  constructor(private http: HttpClient) {}

  askAI(message: string): Observable<AskAIResponse> {
    return this.http.post<AskAIResponse>(
      `${this.baseUrl}/ask`,
      { message },
      { withCredentials: true },
    );
  }
}
