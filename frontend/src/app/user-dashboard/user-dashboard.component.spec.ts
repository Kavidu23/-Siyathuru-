import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';

import { UserDashboardComponent } from './user-dashboard.component';
import { CommunityService } from '../services/community.service';
import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';
import { EventService } from '../services/event.service';
import { ChatService } from '../services/chat.service';
import { provideRouter, Router } from '@angular/router';

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;
  let authState$: Subject<any>;
  let router: Router;
  let navigateSpy: jasmine.Spy;
  let httpMock: HttpTestingController;

  let communityServiceMock: any;
  let alertServiceMock: any;
  let eventServiceMock: any;
  const chatServiceMock = {
    hasUnread$: new Subject<boolean>(),
  };

  beforeEach(() => {
    communityServiceMock = {
      getAllCommunities: jasmine.createSpy('getAllCommunities').and.returnValue(of([])),
    };

    alertServiceMock = {
      getAlertsByUserId: jasmine.createSpy('getAlertsByUserId').and.returnValue(of({ data: [] })),
    };

    eventServiceMock = {
      getEventsByUserId: jasmine.createSpy('getEventsByUserId').and.returnValue(of({ data: [] })),
      joinEvent: jasmine.createSpy('joinEvent').and.returnValue(of({})),
    };
  });

  beforeEach(async () => {
    authState$ = new Subject<any>();

    const userServiceMock = {
      authState$,
      validateSession: jasmine.createSpy('validateSession').and.returnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [UserDashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: CommunityService, useValue: communityServiceMock },
        { provide: AlertService, useValue: alertServiceMock },
        { provide: EventService, useValue: eventServiceMock },
        { provide: ChatService, useValue: chatServiceMock },
        { provide: UserService, useValue: userServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('redirects to home when auth user is null', () => {
    authState$.next(null);

    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('loads alerts and updates alerts count', () => {
    alertServiceMock.getAlertsByUserId.and.returnValue(
      of({ data: [{ _id: 'a1' }, { _id: 'a2' }] }),
    );

    component.userData = { _id: 'u1' };
    component.loadAlerts();

    expect(alertServiceMock.getAlertsByUserId).toHaveBeenCalledWith('u1');
    expect(component.alertsCount).toBe(2);
    expect(component.alerts.length).toBe(2);
  });

  it('does not call join API when user already joined the event', () => {
    component.userData = { _id: 'u1', name: 'Test User', email: 'test@example.com' };
    const event = { _id: 'e1', attendees: [{ _id: 'u1' }] };
    const alertSpy = spyOn(window, 'alert');

    component.joinEvent(event);

    expect(eventServiceMock.joinEvent).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('You have already joined this event');
  });

  it('resolves the district name from saved user coordinates', () => {
    component.userData = {
      _id: 'u1',
      name: 'Test User',
      location: {
        coordinates: {
          latitude: 6.9271,
          longitude: 79.8612,
        },
      },
    };

    (component as any).districts = [
      { district: 'Colombo', lat: 6.9271, lng: 79.8612 },
      { district: 'Galle', lat: 6.0535, lng: 80.221 },
    ];

    component.loadCity();

    expect(component.userCity).toBe('Colombo');
  });
});
