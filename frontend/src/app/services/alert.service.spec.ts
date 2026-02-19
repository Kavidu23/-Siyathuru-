import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { AlertService, AlertPayload } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(AlertService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('createAlert sends POST with payload and credentials', () => {
    const payload: AlertPayload = {
      communityId: 'c1',
      title: 'Flood Warning',
      message: 'Heavy rain expected',
      severity: 'warning',
      isActive: true,
    };

    service.createAlert(payload).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/alerts'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true, data: { _id: 'a1' } });
  });

  it('getAlertsByUserId sends GET with credentials', () => {
    service.getAlertsByUserId('u1').subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/alerts/user/u1'));
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true, data: [] });
  });

  it('updateAlert sends PUT with partial payload and credentials', () => {
    service.updateAlert('a1', { title: 'Updated Title', isActive: false }).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/alerts/a1'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'Updated Title', isActive: false });
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true });
  });

  it('deleteAlert sends DELETE with credentials', () => {
    service.deleteAlert('a1').subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/alerts/a1'));
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true });
  });
});
