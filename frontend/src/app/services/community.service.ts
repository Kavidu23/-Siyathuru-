import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  // Base URL automatically switches for local or Docker
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/communities'
    : 'http://backend:3000/api/communities'; // backend service name in Docker

  constructor(private http: HttpClient) {}

  // POST: upload community image to Cloudinary and return URL
  uploadCommunityImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const uploadUrl = window.location.hostname.includes('localhost')
      ? 'http://localhost:3000/api/upload'
      : 'http://backend:3000/api/upload';
    return this.http.post<any>(uploadUrl, formData);
  }

  // POST: create a new community
  createCommunity(community: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, community);
  }

  // POST: create a new community with JSON payload (images already uploaded to Cloudinary)
  createCommunityWithPayload(payload: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
  }

  // GET: fetch all communities
  getAllCommunities(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // GET: fetch a community by ID
  getCommunityById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // DELETE: remove a community
  deleteCommunity(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, {
      withCredentials: true,
    });
  }

  // POST: join a community (body contains { userId })
  joinCommunity(id: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/join`, { userId });
  }

  // POST: leave a community (body contains { userId })
  leaveCommunity(id: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/leave`, { userId });
  }

  // DELETE: remove a member from community (leader only)
  removeMember(communityId: string, memberId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.baseUrl}/${communityId}/members/${memberId}`,
      { withCredentials: true },
    );
  }

  // POST: request to join a private community
  requestJoinCommunity(userId: string, communityId: string): Observable<any> {
    const requestUrl = window.location.hostname.includes('localhost')
      ? 'http://localhost:3000/api/requests'
      : 'http://backend:3000/api/requests';
    return this.http.post<any>(requestUrl, {
      userId,
      communityId,
      status: 'pending',
    });
  }

  // GET: fetch communities by leader ID
  getCommunitiesByLeader(leaderId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/leader/${leaderId}`);
  }

  getUsersByCommunity(communityId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${communityId}`, {
      withCredentials: true,
    });
  }
}
