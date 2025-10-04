import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunityDashboardComponent } from './community-dashboard.component';

describe('CommunityDashboardComponent', () => {
  let component: CommunityDashboardComponent;
  let fixture: ComponentFixture<CommunityDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityDashboardComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
