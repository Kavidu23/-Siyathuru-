import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommunityProfileComponent } from './community-profile.component';
import { CommunityService } from '../services/community.service';


describe('CommunityProfileComponent', () => {
  let component: CommunityProfileComponent;
  let fixture: ComponentFixture<CommunityProfileComponent>;

  const communityServiceMock = {
    getCommunityById: jasmine.createSpy('getCommunityById').and.returnValue(
      of({
        data: {
          name: 'Test Community',
          location: { coordinates: { latitude: 6.9271, longitude: 79.8612 } },
          media: { facebook: '', instagram: '', whatsapp: '', reddit: '' },
          contact: { name: 'Test User', phone: '0712345678', email: 'test@example.com' },
          members: []

        }
      })
    )
  };

  const activatedRouteMock = {
    snapshot: { paramMap: { get: () => 'mock-id' } }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityProfileComponent],
      providers: [
        { provide: CommunityService, useValue: communityServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch community on ngOnInit', () => {
    component.ngOnInit();
    expect(communityServiceMock.getCommunityById).toHaveBeenCalledWith('mock-id');
    expect(component.community.name).toBe('Test Community');
  });


  it('should open and close image modal', () => {
    const testImage = 'test-image.jpg';
    component.openImage(testImage);
    expect(component.selectedImage).toBe(testImage);
    component.closeImage();
    expect(component.selectedImage).toBeNull();
  });
});
