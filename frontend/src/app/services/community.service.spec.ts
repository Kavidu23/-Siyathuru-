import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { CommunityService } from './community.service';

describe('CommunityService', () => {
  let service: CommunityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(CommunityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getAllCommunities sends GET to communities endpoint', () => {
    service.getAllCommunities().subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/communities'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('createCommunityWithPayload sends POST with JSON and credentials', () => {
    const payload = { name: 'Test Community', type: 'Youth' };

    service.createCommunityWithPayload(payload).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/communities'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.withCredentials).toBeTrue();
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush({ success: true });
  });

  it('uploadCommunityImage sends file as FormData', () => {
    const file = new File(['x'], 'test.png', { type: 'image/png' });

    service.uploadCommunityImage(file).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/upload'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush({ data: { url: 'https://img.test/test.png' } });
  });

  it('deleteCommunity sends DELETE with credentials', () => {
    service.deleteCommunity('c1').subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/communities/c1'));
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true });
  });

  it('joinCommunity sends POST with userId payload', () => {
    service.joinCommunity('c1', 'u1').subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/communities/c1/join'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId: 'u1' });
    req.flush({ success: true });
  });

  it('verifyCommunity sends POST with credentials', () => {
    service.verifyCommunity('c1').subscribe();

    const req = httpMock.expectOne((r) =>
      r.url.endsWith('/api/community-verification/verify'),
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ communityId: 'c1' });
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true });
  });
});
