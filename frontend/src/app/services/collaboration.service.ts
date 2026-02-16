import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SuggestionResponse {
  success: boolean;
  message?: string;
  data?: any; // Suggested communities array
  error?: string;
  details?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CollaborationService {
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/collaborations'
    : 'http://backend:3000/api/collaborations';

  constructor(private http: HttpClient) {}

  // Get suggested communities based on a given community ID
  getSuggestions(communityId: string): Observable<SuggestionResponse> {
    return this.http.get<SuggestionResponse>(`${this.baseUrl}/${communityId}`, {
      withCredentials: true,
    });
  }
}
