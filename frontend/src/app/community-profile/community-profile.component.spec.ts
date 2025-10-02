import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityProfileComponent } from './community-profile.component';

describe('CommunityProfileComponent', () => {
  let component: CommunityProfileComponent;
  let fixture: ComponentFixture<CommunityProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityProfileComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CommunityProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize map', () => {
    expect(component.map).toBeDefined();
  });

  it('should open and close image modal', () => {
    const testImage = 'test-image.jpg';
    component.openImage(testImage);
    expect(component.selectedImage).toBe(testImage);
    component.closeImage();
    expect(component.selectedImage).toBeNull();
  });


});
