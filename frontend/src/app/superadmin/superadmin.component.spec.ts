import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

import { SuperadminComponent } from './superadmin.component';
import { CommunityService } from '../services/community.service';
import { UserService } from '../services/user.service';

describe('SuperadminComponent', () => {
  let component: SuperadminComponent;
  let fixture: ComponentFixture<SuperadminComponent>;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  let currentUser: any;

  const communityServiceMock = {
    getAllCommunities: jasmine.createSpy('getAllCommunities'),
    deleteCommunity: jasmine
      .createSpy('deleteCommunity')
      .and.returnValue(of({ message: 'Removed' })),
  };

  const userServiceMock = {
    getCurrentUser: jasmine.createSpy('getCurrentUser').and.callFake(() => currentUser),
    validateSession: jasmine.createSpy('validateSession').and.returnValue(of({ user: null })),
    getUsers: jasmine.createSpy('getUsers').and.returnValue(of({ data: [] })),
    deleteUser: jasmine.createSpy('deleteUser').and.returnValue(of({ message: 'User removed' })),
  };

  beforeEach(async () => {
    currentUser = { _id: 'u1', role: 'admin' };
    communityServiceMock.getAllCommunities.and.returnValue(of({ data: [] }));
    userServiceMock.getUsers.and.returnValue(of({ data: [] }));

    await TestBed.configureTestingModule({
      imports: [SuperadminComponent],
      providers: [
        { provide: CommunityService, useValue: communityServiceMock },
        { provide: UserService, useValue: userServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(SuperadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    navigateSpy.calls.reset();
    communityServiceMock.deleteCommunity.calls.reset();
    userServiceMock.deleteUser.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('redirects to home when current user is not admin', () => {
    currentUser = { _id: 'u2', role: 'member' };
    fixture = TestBed.createComponent(SuperadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('loads dashboard totals for admin', () => {
    userServiceMock.getUsers.and.returnValue(
      of({
        data: [
          { _id: 'u1', joinedCommunities: ['c1'] },
          { _id: 'u2', joinedCommunities: [] },
          { _id: 'u3', joinedCommunities: ['c2'] },
        ],
      }),
    );
    communityServiceMock.getAllCommunities.and.returnValue(
      of({ data: [{ _id: 'c1' }, { _id: 'c2' }] }),
    );

    fixture = TestBed.createComponent(SuperadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.totalUsers).toBe(3);
    expect(component.totalCommunities).toBe(2);
    expect(component.activeEngagement).toBe(67);
    expect(component.isLoading).toBeFalse();
  });

  it('does not delete community when confirmation is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.RemoveCommunity({ _id: 'c1', name: 'Test Community' });

    expect(communityServiceMock.deleteCommunity).not.toHaveBeenCalled();
    expect(component.isDeleting).toBeFalse();
  });

  it('deletes community and updates totals on success', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const alertSpy = spyOn(window, 'alert');
    component.communities = [
      { _id: 'c1', name: 'One' },
      { _id: 'c2', name: 'Two' },
    ];
    component.totalCommunities = 2;

    component.RemoveCommunity({ _id: 'c1', name: 'One' });

    expect(communityServiceMock.deleteCommunity).toHaveBeenCalledWith('c1');
    expect(component.communities.length).toBe(1);
    expect(component.totalCommunities).toBe(1);
    expect(component.isDeleting).toBeFalse();
    expect(alertSpy).toHaveBeenCalledWith('Removed');
  });

  it('removes platform user and updates totals on success', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const alertSpy = spyOn(window, 'alert');
    component.platformUsers = [
      { _id: 'u2', joinedCommunities: ['c1'], role: 'member' },
      { _id: 'u3', joinedCommunities: [], role: 'leader' },
    ];
    component.totalUsers = 2;
    component.activeEngagement = 50;

    component.removeUser({ _id: 'u2', name: 'Member User' });

    expect(userServiceMock.deleteUser).toHaveBeenCalledWith('u2');
    expect(component.platformUsers.length).toBe(1);
    expect(component.totalUsers).toBe(1);
    expect(component.activeEngagement).toBe(0);
    expect(alertSpy).toHaveBeenCalledWith('User removed');
  });

  it('does not remove current admin user', () => {
    const alertSpy = spyOn(window, 'alert');
    component.removeUser({ _id: 'u1', name: 'Admin' });
    expect(userServiceMock.deleteUser).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('You cannot remove your own admin account.');
  });
});
