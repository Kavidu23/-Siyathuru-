import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('createEvent sends POST with payload and credentials', () => {
    const payload = {
      communityId: 'c1',
      title: 'Cleanup',
      description: 'Beach cleanup',
      location: 'Colombo',
      eventDate: '2026-03-01',
      eventTime: '10:00 AM',
      attendees: [],
    };

    service.createEvent(payload as any).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/events'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true });
  });

  it('getEvents sends GET with credentials', () => {
    service.getEvents().subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/events'));
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true, message: 'ok', data: [] });
  });

  it('getEventById sends GET to event id endpoint', () => {
    service.getEventById('e1').subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/events/e1'));
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true, data: {} });
  });

  it('joinEvent sends POST with eventId and userId plus credentials', () => {
    service.joinEvent('e1', 'u1').subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/events/join'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ eventId: 'e1', userId: 'u1' });
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true });
  });

  it('getEventsByUserId sends GET with credentials', () => {
    service.getEventsByUserId('u1').subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/events/user/u1'));
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true, count: 0, data: [] });
  });
});
