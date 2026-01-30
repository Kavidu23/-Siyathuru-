import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Base URL automatically switches for local or Docker
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/users'
    : 'http://backend:3000/api/users'; // backend service name in Docker

  constructor(private http: HttpClient) {}

  // POST new user
  createUser(user: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, user);
  }

  // Verify user account with code
  verifyUser(payload: { email: string; code: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/verify`, payload);
  }

  // Login user with email and password
  loginUser(payload: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, payload);
  }

  // Upload profile image and return URL
  uploadProfileImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const uploadUrl = window.location.hostname.includes('localhost')
      ? 'http://localhost:3000/api/upload'
      : 'http://backend:3000/api/upload';
    return this.http.post<any>(uploadUrl, formData);
  }

  // Get all users
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  //Get user by id
  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // Update user by id
  updateUser(id: string, user: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, user);
  }

  // Delete user by id
  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
