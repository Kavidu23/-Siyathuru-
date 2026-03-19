import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SignupComponent } from './signup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Subject } from 'rxjs';
import { ModalService } from '../services/modal.service';
import { UserService } from '../services/user.service';

describe('SignupComponent', () => {
  let component: SignupComponent;

  const modalServiceMock = {
    signupVisible$: new Subject<boolean>(),
    signupVerificationEmail$: new Subject<string | null>(),
    openSignup: jasmine.createSpy('openSignup'),
    closeSignup: jasmine.createSpy('closeSignup'),
    openLogin: jasmine.createSpy('openLogin'),
    clearSignupVerificationEmail: jasmine.createSpy('clearSignupVerificationEmail'),
  };

  const userServiceMock = {
    uploadProfileImage: jasmine.createSpy('uploadProfileImage'),
    createUser: jasmine.createSpy('createUser'),
    verifyUser: jasmine.createSpy('verifyUser'),
    checkUserAvailability: jasmine.createSpy('checkUserAvailability'),
  };

  beforeEach(async () => {
    Object.values(userServiceMock).forEach((spy: any) => spy.calls?.reset?.());

    await TestBed.configureTestingModule({
      imports: [SignupComponent, HttpClientTestingModule],
      providers: [
        { provide: ModalService, useValue: modalServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
  });

  it('creates the form with validators', () => {
    expect(component.userForm).toBeTruthy();
    expect(component.userForm.valid).toBeFalse();
  });

  it('flags password mismatch on the form group', () => {
    component.userForm.setValue({
      username: 'johnsmith',
      email: 'john@example.com',
      phone: '0771234567',
      password: 'pass123',
      confirmPassword: 'pass124',
      city: 'Colombo',
      latitude: 6.9271,
      longitude: 79.8612,
      age: 25,
      memberType: 'member',
    });

    expect(component.userForm.errors?.['mismatch']).toBeTrue();

    component.userForm.patchValue({ confirmPassword: 'pass123' });
    component.userForm.updateValueAndValidity();
    expect(component.userForm.errors).toBeNull();
  });

  it('does not submit when form is invalid', () => {
    const alertSpy = spyOn(window, 'alert');

    component.onSubmit();

    expect(component.submitted).toBeTrue();
    expect(component.isLoading).toBeFalse();
    expect(userServiceMock.createUser).not.toHaveBeenCalled();
    expect(userServiceMock.uploadProfileImage).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
  });

  it('patches latitude and longitude when a city is selected', () => {
    component.cities = [{ id: 1, name_en: 'Colombo', latitude: 6.9271, longitude: 79.8612 }];

    component.onCitySelected({ target: { value: 1 } });

    expect(component.userForm.value.latitude).toBe(6.9271);
    expect(component.userForm.value.longitude).toBe(79.8612);
  });

  it('shows an NSFW alert and does not create the account when profile upload is rejected', () => {
    const alertSpy = spyOn(window, 'alert');

    component.userForm.setValue({
      username: 'johnsmith',
      email: 'john@example.com',
      phone: '0771234567',
      password: 'pass123',
      confirmPassword: 'pass123',
      city: '1',
      latitude: 6.9271,
      longitude: 79.8612,
      age: 25,
      memberType: 'member',
    });
    component.profileFile = new File(['profile'], 'profile.png', { type: 'image/png' });

    userServiceMock.checkUserAvailability.and.returnValue(
      of({ data: { emailExists: false, phoneExists: false } }),
    );
    userServiceMock.uploadProfileImage.and.returnValue(
      throwError(() => ({ error: { error: 'NSFW content detected in image' } })),
    );

    component.onSubmit();

    expect(userServiceMock.uploadProfileImage).toHaveBeenCalled();
    expect(userServiceMock.createUser).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(alertSpy).toHaveBeenCalledWith(
      'The selected profile image was rejected because it may contain inappropriate or NSFW content. Please choose a different image.',
    );
  });

  it('does not create the account when profile image upload fails for another reason', () => {
    const alertSpy = spyOn(window, 'alert');

    component.userForm.setValue({
      username: 'johnsmith',
      email: 'john@example.com',
      phone: '0771234567',
      password: 'pass123',
      confirmPassword: 'pass123',
      city: '1',
      latitude: 6.9271,
      longitude: 79.8612,
      age: 25,
      memberType: 'member',
    });
    component.profileFile = new File(['profile'], 'profile.png', { type: 'image/png' });

    userServiceMock.checkUserAvailability.and.returnValue(
      of({ data: { emailExists: false, phoneExists: false } }),
    );
    userServiceMock.uploadProfileImage.and.returnValue(
      throwError(() => ({ error: { error: 'Cloudinary upload failed' } })),
    );

    component.onSubmit();

    expect(userServiceMock.createUser).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(alertSpy).toHaveBeenCalledWith(
      'We could not upload your profile image, so your account was not created. Please try again with a different image.',
    );
  });
});
