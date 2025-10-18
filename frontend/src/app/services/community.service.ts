import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {

  // Base URL automatically switches for local or Docker
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/communities'
    : 'http://backend:3000/api/communities'; // backend service name in Docker

  constructor(private http: HttpClient) { }

  // POST: create a new community
  createCommunity(community: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, community);
  }

  // GET: fetch all communities
  getAllCommunities(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // GET: fetch a community by ID
  getCommunityById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
}
