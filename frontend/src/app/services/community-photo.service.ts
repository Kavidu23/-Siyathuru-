// src/app/services/community-photo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommunityPhoto {
  _id: string;
  communityId: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommunityPhotoService {
  private baseUrl = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api/community-photos'
    : '/api/community-photos';

  constructor(private http: HttpClient) {}

  /** Upload a photo */
  uploadPhoto(
    communityId: string,
    file: File,
    caption?: string,
  ): Observable<CommunityPhoto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('communityId', communityId);
    if (caption) formData.append('caption', caption);

    return this.http.post<CommunityPhoto>(`${this.baseUrl}/`, formData, {
      withCredentials: true,
    });
  }

  /** Get all photos for a community */
  getPhotosByCommunity(communityId: string): Observable<CommunityPhoto[]> {
    return this.http.get<CommunityPhoto[]>(
      `${this.baseUrl}/community/${communityId}`,
      {
        withCredentials: true,
      },
    );
  }

  /** Delete a photo */
  deletePhoto(
    photoId: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${photoId}`,
      { withCredentials: true },
    );
  }
}
