import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartDashboardComponent } from './charts.component';
import { ViewportScroller } from '@angular/common';

// Mock the ViewportScroller
class MockViewportScroller {
  scrollToPosition = jasmine.createSpy('scrollToPosition');
}

describe('ChartDashboardComponent', () => {
  let component: ChartDashboardComponent;
  let fixture: ComponentFixture<ChartDashboardComponent>;
  let viewportScroller: MockViewportScroller;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartDashboardComponent],
      providers: [{ provide: ViewportScroller, useClass: MockViewportScroller }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChartDashboardComponent);
    component = fixture.componentInstance;
    viewportScroller = TestBed.inject(ViewportScroller) as unknown as MockViewportScroller;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call scrollToPosition on init', () => {
    expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
  });

  it('should contain three chart canvas elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const canvases = compiled.querySelectorAll('canvas');
    expect(canvases.length).toBe(3);
  });

  it('should have correct chart headings', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = Array.from(compiled.querySelectorAll('h3')).map(h => h.textContent?.trim());
    expect(headings).toContain('User Growth Trend');
    expect(headings).toContain('User Activity Breakdown');
    expect(headings).toContain('Community Categories');
  });
});
