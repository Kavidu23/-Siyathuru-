import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

import { NavbarComponent } from './navbar.component';
import { ModalService } from '../services/modal.service';
import { UserService } from '../services/user.service';
import { ChatService } from '../services/chat.service';
import { CommunityService } from '../services/community.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authState$: Subject<any>;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  const modalServiceMock = {
    openLogin: jasmine.createSpy('openLogin'),
    openSignup: jasmine.createSpy('openSignup'),
  };

  const userServiceMock = {
    authState$: new Subject<any>(),
    validateSession: jasmine.createSpy('validateSession').and.returnValue(of({})),
    logoutUser: jasmine.createSpy('logoutUser').and.returnValue(of({})),
  };

  const chatServiceMock = {
    hasUnread$: new Subject<boolean>(),
    startUnreadListenerForCommunities: jasmine
      .createSpy('startUnreadListenerForCommunities')
      .and.returnValue(() => {}),
  };

  const communityServiceMock = {
    getAllCommunities: jasmine.createSpy('getAllCommunities').and.returnValue(of({ data: [] })),
    getCommunitiesByLeader: jasmine
      .createSpy('getCommunitiesByLeader')
      .and.returnValue(of({ data: [] })),
  };

  beforeEach(async () => {
    authState$ = new Subject<any>();
    userServiceMock.authState$ = authState$;

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: ModalService, useValue: modalServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ChatService, useValue: chatServiceMock },
        { provide: CommunityService, useValue: communityServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    modalServiceMock.openLogin.calls.reset();
    modalServiceMock.openSignup.calls.reset();
    userServiceMock.logoutUser.calls.reset();
    communityServiceMock.getAllCommunities.calls.reset();
    communityServiceMock.getCommunitiesByLeader.calls.reset();
    chatServiceMock.startUnreadListenerForCommunities.calls.reset();
    navigateSpy.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates login state from authState and loads unread setup for logged user', () => {
    authState$.next({ _id: 'u1', role: 'member', joinedCommunities: [] });

    expect(component.isLoggedIn).toBeTrue();
    expect(component.userData?._id).toBe('u1');
    expect(communityServiceMock.getAllCommunities).toHaveBeenCalled();
  });

  it('navigates to superadmin for admin user', () => {
    component.isLoggedIn = true;
    component.userData = { _id: 'u1', role: 'admin' };

    component.goToUserDashboard();

    expect(navigateSpy).toHaveBeenCalledWith(['/superadmin']);
  });

  it('redirects leader without a community to create-community', () => {
    component.isLoggedIn = true;
    component.userData = { _id: 'leader-1', role: 'leader' };
    communityServiceMock.getCommunitiesByLeader.and.returnValue(of({ data: [] }));

    component.goToUserDashboard();

    expect(communityServiceMock.getCommunitiesByLeader).toHaveBeenCalledWith('leader-1');
    expect(navigateSpy).toHaveBeenCalledWith(['/create-community']);
  });

  it('navigates leader with a community to community-dashboard', () => {
    component.isLoggedIn = true;
    component.userData = { _id: 'leader-1', role: 'leader' };
    communityServiceMock.getCommunitiesByLeader.and.returnValue(of({ data: [{ _id: 'c1' }] }));

    component.goToUserDashboard();

    expect(communityServiceMock.getCommunitiesByLeader).toHaveBeenCalledWith('leader-1');
    expect(navigateSpy).toHaveBeenCalledWith(['/community-dashboard']);
  });

  it('navigates home after successful logout', () => {
    component.logout();

    expect(userServiceMock.logoutUser).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });
});
