import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentEventComponent } from './recent-event.component';

describe('RecentEventComponent', () => {
  let component: RecentEventComponent;
  let fixture: ComponentFixture<RecentEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
