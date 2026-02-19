import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { ReviewComponent } from './review.component';
import { PrivateCommunityService } from '../services/privateCommunity.service';
import { UserService } from '../services/user.service';

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let fixture: ComponentFixture<ReviewComponent>;
  let queryParams$: Subject<any>;

  const privateCommunityServiceMock = {
    getJoinRequests: jasmine.createSpy('getJoinRequests').and.returnValue(
      of({
        success: true,
        joinRequests: [],
      }),
    ),
    handleJoinRequest: jasmine.createSpy('handleJoinRequest').and.returnValue(of({ success: true })),
  };

  const userServiceMock = {};

  beforeEach(async () => {
    queryParams$ = new Subject<any>();

    await TestBed.configureTestingModule({
      imports: [ReviewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$ } },
        { provide: PrivateCommunityService, useValue: privateCommunityServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    privateCommunityServiceMock.getJoinRequests.calls.reset();
    privateCommunityServiceMock.handleJoinRequest.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads join requests when communityId is present in query params', () => {
    privateCommunityServiceMock.getJoinRequests.and.returnValue(
      of({
        success: true,
        joinRequests: [
          {
            _id: 'r1',
            user: { _id: 'u1', name: 'John', email: 'john@example.com' },
            requestedAt: '2026-01-01',
          },
        ],
      }),
    );

    queryParams$.next({ communityId: 'c1' });

    expect(component.communityId).toBe('c1');
    expect(privateCommunityServiceMock.getJoinRequests).toHaveBeenCalledWith('c1');
    expect(component.joinRequests.length).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it('shows alert when no communityId in query params', () => {
    const alertSpy = spyOn(window, 'alert');

    queryParams$.next({});

    expect(alertSpy).toHaveBeenCalledWith('No community selected for review.');
    expect(privateCommunityServiceMock.getJoinRequests).not.toHaveBeenCalled();
  });

  it('accepts request and removes it from list', () => {
    const alertSpy = spyOn(window, 'alert');
    component.communityId = 'c1';
    component.joinRequests = [
      {
        _id: 'r1',
        user: { _id: 'u1', name: 'John', email: 'john@example.com' },
        requestedAt: '2026-01-01',
      },
    ];

    component.acceptRequest(component.joinRequests[0] as any);

    expect(privateCommunityServiceMock.handleJoinRequest).toHaveBeenCalledWith('c1', 'u1', true);
    expect(component.joinRequests.length).toBe(0);
    expect(alertSpy).toHaveBeenCalledWith('Request approved successfully! ');
  });

  it('rejects request and removes it from list', () => {
    const alertSpy = spyOn(window, 'alert');
    component.communityId = 'c1';
    component.joinRequests = [
      {
        _id: 'r1',
        user: { _id: 'u1', name: 'John', email: 'john@example.com' },
        requestedAt: '2026-01-01',
      },
    ];

    component.rejectRequest(component.joinRequests[0] as any);

    expect(privateCommunityServiceMock.handleJoinRequest).toHaveBeenCalledWith('c1', 'u1', false);
    expect(component.joinRequests.length).toBe(0);
    expect(alertSpy).toHaveBeenCalledWith('Request rejected successfully! ');
  });
});
