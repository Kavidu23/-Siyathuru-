import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // ================= AUTH STATE =================
  private authState = new BehaviorSubject<any>(null); // no localStorage
  authState$ = this.authState.asObservable();

  // =============== BASE URL =====================
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/users'
    : 'http://backend:3000/api/users';

  constructor(private http: HttpClient) {}

  // ================= AUTH METHODS =================

  loginUser(payload: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, payload, { withCredentials: true }).pipe(
      tap((res) => {
        // ✅ Only update auth state, do NOT store sensitive info in localStorage
        this.authState.next(res.user);
      }),
    );
  }

  logoutUser(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.authState.next(null);
      }),
    );
  }

  getCurrentUser() {
    return this.authState.value;
  }

  isLoggedIn(): boolean {
    return !!this.authState.value;
  }

  // ============= SESSION VALIDATION =============
  validateSession(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res.success && res.user) {
          this.authState.next(res.user); // now navbar gets the user
        } else {
          this.clearSession();
        }
      }),
    );
  }

  private clearSession() {
    this.authState.next(null);
  }

  // ============= OTHER EXISTING METHODS =============
  createUser(user: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, user);
  }

  checkUserAvailability(email: string, pnumber: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/check-availability?email=${encodeURIComponent(email)}&pnumber=${encodeURIComponent(pnumber)}`,
    );
  }

  verifyUser(payload: { email: string; code: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/verify`, payload);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reset-password`, {
      token,
      password,
    });
  }

  uploadProfileImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = window.location.hostname.includes('localhost')
      ? 'http://localhost:3000/api/upload'
      : 'http://backend:3000/api/upload';

    return this.http.post<any>(uploadUrl, formData);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
