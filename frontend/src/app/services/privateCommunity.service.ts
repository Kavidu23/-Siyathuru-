import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrivateCommunityService {
  // Base URL (local vs docker)
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/private-communities'
    : 'http://backend:3000/api/private-communities';

  constructor(private http: HttpClient) {}

  /* SEND JOIN REQUEST (PRIVATE COMMUNITY) */
  sendJoinRequest(communityId: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/${communityId}/join`,
      {},
      { withCredentials: true },
    );
  }

  /* CANCEL OWN JOIN REQUEST */
  cancelJoinRequest(communityId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${communityId}/join`, {
      withCredentials: true,
    });
  }

  /* LEADER: APPROVE / REJECT JOIN REQUEST */
  handleJoinRequest(
    communityId: string,
    userId: string,
    approve: boolean,
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/${communityId}/requests/handle`,
      { userId, approve },
      { withCredentials: true },
    );
  }

  /*LEADER: GET ALL JOIN REQUESTS */
  getJoinRequests(communityId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${communityId}/requests`, {
      withCredentials: true,
    });
  }
}
