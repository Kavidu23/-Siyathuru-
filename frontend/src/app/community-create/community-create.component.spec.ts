import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunityCreateComponent } from './community-create.component';
import { CommunityService } from '../services/community.service';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

describe('CommunityCreateComponent', () => {
  let component: CommunityCreateComponent;
  let fixture: ComponentFixture<CommunityCreateComponent>;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  const communityServiceMock = {
    uploadCommunityImage: jasmine
      .createSpy('uploadCommunityImage')
      .and.returnValue(of({ data: { url: 'https://img.test/file.jpg' } })),
    createCommunityWithPayload: jasmine
      .createSpy('createCommunityWithPayload')
      .and.returnValue(of({ success: true, data: { _id: '123' } })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityCreateComponent],
      providers: [{ provide: CommunityService, useValue: communityServiceMock }, provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(CommunityCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    communityServiceMock.uploadCommunityImage.calls.reset();
    communityServiceMock.createCommunityWithPayload.calls.reset();
    navigateSpy.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not submit when banner/profile images are missing', () => {
    const alertSpy = spyOn(window, 'alert');
    const form = component.communityForm;
    form.controls['name'].setValue('Test Community');
    form.controls['type'].setValue('Youth');
    form.controls['address'].setValue('Colombo');
    form.controls['latitude'].setValue(6.9271);
    form.controls['longitude'].setValue(79.8612);
    form.controls['contactName'].setValue('John Doe');
    form.controls['phone'].setValue('0712345678');
    form.controls['email'].setValue('test@example.com');

    component.onSubmit();

    expect(alertSpy).toHaveBeenCalledWith('Banner and Profile images are required.');
    expect(communityServiceMock.createCommunityWithPayload).not.toHaveBeenCalled();
  });

  it('calls upload flow when form is valid and images are present', () => {
    const uploadSpy = spyOn(component, 'uploadCommunityCoverImages');
    const form = component.communityForm;
    component.bannerFile = new File(['banner'], 'banner.png', { type: 'image/png' });
    component.profileFile = new File(['profile'], 'profile.png', { type: 'image/png' });

    form.controls['name'].setValue('Test Community');
    form.controls['type'].setValue('Youth');
    form.controls['address'].setValue('Colombo');
    form.controls['latitude'].setValue(6.9271);
    form.controls['longitude'].setValue(79.8612);
    form.controls['contactName'].setValue('John Doe');
    form.controls['phone'].setValue('0712345678');
    form.controls['email'].setValue('test@example.com');

    component.onSubmit();

    expect(component.isLoading).toBeTrue();
    expect(uploadSpy).toHaveBeenCalled();
  });

  it('submits community payload and navigates on success', () => {
    const alertSpy = spyOn(window, 'alert');
    component.communityForm.patchValue({
      name: 'Test Community',
      type: 'Youth',
      address: 'Colombo',
      latitude: 6.9271,
      longitude: 79.8612,
      contactName: 'John Doe',
      phone: '0712345678',
      email: 'test@example.com',
    });

    component.submitCommunityWithImages(
      'https://img.test/banner.jpg',
      'https://img.test/profile.jpg',
    );

    expect(communityServiceMock.createCommunityWithPayload).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Community created successfully!');
    expect(navigateSpy).toHaveBeenCalledWith(['/community', '123']);
    expect(component.isLoading).toBeFalse();
  });

  it('resets form and preview images', () => {
    component.bannerFile = new File(['banner'], 'banner.png', { type: 'image/png' });
    component.profileFile = new File(['profile'], 'profile.png', { type: 'image/png' });
    component.bannerPreview = 'banner-preview';
    component.profilePreview = 'profile-preview';

    component.onReset();

    expect(component.bannerFile).toBeNull();
    expect(component.profileFile).toBeNull();
    expect(component.bannerPreview).toBeNull();
    expect(component.profilePreview).toBeNull();
    expect(component.submitted).toBeFalse();
  });
});
