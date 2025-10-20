import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommunityCreateComponent } from './community-create.component';
import { CommunityService } from '../services/community.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('CommunityCreateComponent', () => {
  let component: CommunityCreateComponent;
  let fixture: ComponentFixture<CommunityCreateComponent>;
  let communityServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    // Mock CommunityService
    communityServiceMock = {
      createCommunity: jasmine.createSpy('createCommunity').and.returnValue(
        of({ success: true, data: { _id: '123' } })
      )
    };

    // Mock Router
    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CommunityCreateComponent],
      providers: [
        { provide: CommunityService, useValue: communityServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    const form = component.communityForm;
    expect(form).toBeDefined();
    expect(form.controls['name'].value).toBe('');
    expect(form.controls['type'].value).toBe('');
  });

  it('should mark form invalid when required fields are empty', () => {
    component.submitted = true;
    component.onSubmit();
    expect(component.communityForm.invalid).toBeTrue();
  });

  it('should submit the form when valid and navigate', fakeAsync(() => {
    const form = component.communityForm;

    // Mock banner/profile files
    component.bannerFile = new File(['banner'], 'banner.png', { type: 'image/png' });
    component.profileFile = new File(['profile'], 'profile.png', { type: 'image/png' });

    // Fill form
    form.controls['name'].setValue('Test Community');
    form.controls['type'].setValue('Youth');
    form.controls['address'].setValue('Colombo');
    form.controls['latitude'].setValue(6.9271);
    form.controls['longitude'].setValue(79.8612);
    form.controls['contactName'].setValue('John Doe');
    form.controls['phone'].setValue('0712345678');
    form.controls['email'].setValue('test@example.com');

    // Submit form
    component.onSubmit();
    tick();

    // Assertions
    expect(communityServiceMock.createCommunity).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/community', '123']); // Check navigation
    expect(component.isLoading).toBeFalse(); // Loading should hide
  }));

  it('should handle error on form submission', fakeAsync(() => {
    communityServiceMock.createCommunity.and.returnValue(
      throwError(() => new Error('Server error'))
    );

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

    spyOn(window, 'alert');

    component.onSubmit();
    tick();

    expect(window.alert).toHaveBeenCalledWith(
      'Failed to create community. Check console for details.'
    );
  }));

  it('should reset form and preview images', () => {
    component.bannerFile = new File(['banner'], 'banner.png', { type: 'image/png' });
    component.profileFile = new File(['profile'], 'profile.png', { type: 'image/png' });
    component.bannerPreview = 'banner-preview';
    component.profilePreview = 'profile-preview';

    component.onReset();

    expect(component.bannerFile).toBeNull();
    expect(component.profileFile).toBeNull();
    expect(component.bannerPreview).toBeNull();
    expect(component.profilePreview).toBeNull();
    expect(component.communityForm.pristine).toBeTrue();
  });
});
