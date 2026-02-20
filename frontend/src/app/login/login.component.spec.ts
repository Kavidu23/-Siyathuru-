import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

import { LoginComponent } from './login.component';
import { ModalService } from '../services/modal.service';
import { UserService } from '../services/user.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  const modalServiceMock = {
    loginVisible$: new Subject<boolean>(),
    closeLogin: jasmine.createSpy('closeLogin'),
    openSignup: jasmine.createSpy('openSignup'),
    openSignupForVerification: jasmine.createSpy('openSignupForVerification'),
  };

  const userServiceMock = {
    validateSession: jasmine.createSpy('validateSession').and.returnValue(of({})),
    loginUser: jasmine.createSpy('loginUser'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: ModalService, useValue: modalServiceMock },
        { provide: UserService, useValue: userServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    modalServiceMock.closeLogin.calls.reset();
    modalServiceMock.openSignup.calls.reset();
    modalServiceMock.openSignupForVerification.calls.reset();
    userServiceMock.loginUser.calls.reset();
    navigateSpy.calls.reset();
  });

  it('creates form with required validators', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm.valid).toBeFalse();
  });

  it('does not submit when form is invalid', () => {
    const alertSpy = spyOn(window, 'alert');

    component.onSubmit();

    expect(component.submitted).toBeTrue();
    expect(userServiceMock.loginUser).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Please enter valid email and password.');
  });

  it('navigates to home on successful regular user login', () => {
    userServiceMock.loginUser.and.returnValue(
      of({
        success: true,
        user: { role: 'member', joinedCommunities: ['c1'] },
      }),
    );
    const alertSpy = spyOn(window, 'alert');
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'pass123',
    });

    component.onSubmit();

    expect(userServiceMock.loginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'pass123',
    });
    expect(modalServiceMock.closeLogin).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Login successful!');
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('navigates leader to create-community when they have no communities', () => {
    userServiceMock.loginUser.and.returnValue(
      of({
        success: true,
        user: { role: 'leader', joinedCommunities: [] },
      }),
    );
    const alertSpy = spyOn(window, 'alert');
    component.loginForm.setValue({
      email: 'leader@example.com',
      password: 'pass123',
    });

    component.onSubmit();

    expect(alertSpy).toHaveBeenCalledWith('Welcome Leader! Please create your first community.');
    expect(navigateSpy).toHaveBeenCalledWith(['/create-community']);
  });

  it('opens verification flow when account is not verified', () => {
    userServiceMock.loginUser.and.returnValue(
      throwError(() => ({
        status: 403,
        error: { error: 'Account not verified' },
      })),
    );
    const alertSpy = spyOn(window, 'alert');
    component.loginForm.setValue({
      email: 'pending@example.com',
      password: 'pass123',
    });

    component.onSubmit();

    expect(alertSpy).toHaveBeenCalledWith(
      'Account not verified. Please enter the verification code sent to your email.',
    );
    expect(modalServiceMock.openSignupForVerification).toHaveBeenCalledWith('pending@example.com');
  });
});
