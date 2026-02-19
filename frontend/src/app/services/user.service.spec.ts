import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('loginUser sends POST and updates auth state', () => {
    const user = { _id: 'u1', role: 'member' };

    service.loginUser({ email: 'test@example.com', password: 'pass123' }).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/users/login'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      password: 'pass123',
    });
    expect(req.request.withCredentials).toBeTrue();

    req.flush({ user });

    expect(service.getCurrentUser()).toEqual(user);
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('logoutUser sends POST and clears auth state', () => {
    service.loginUser({ email: 'test@example.com', password: 'pass123' }).subscribe();
    const loginReq = httpMock.expectOne((r) => r.url.endsWith('/api/users/login'));
    loginReq.flush({ user: { _id: 'u1' } });
    expect(service.isLoggedIn()).toBeTrue();

    service.logoutUser().subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/api/users/logout'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    expect(req.request.withCredentials).toBeTrue();

    req.flush({});

    expect(service.getCurrentUser()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('validateSession sets auth state when backend returns valid user', () => {
    const user = { _id: 'u2', role: 'leader' };

    service.validateSession().subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/api/users/me'));
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true, user });

    expect(service.getCurrentUser()).toEqual(user);
  });

  it('validateSession clears auth state when backend response is invalid', () => {
    service.loginUser({ email: 'test@example.com', password: 'pass123' }).subscribe();
    const loginReq = httpMock.expectOne((r) => r.url.endsWith('/api/users/login'));
    loginReq.flush({ user: { _id: 'u1' } });
    expect(service.isLoggedIn()).toBeTrue();

    service.validateSession().subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/api/users/me'));
    req.flush({ success: false, user: null });

    expect(service.getCurrentUser()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('createUser sends POST to users base endpoint', () => {
    const payload = { name: 'John', email: 'john@example.com' };

    service.createUser(payload).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/api/users'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });
});
