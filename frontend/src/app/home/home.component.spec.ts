import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ModalService } from '../modal.service';
import { FeedbackService } from '../services/feedback.service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

class MockModalService {
  openLogin = jasmine.createSpy('openLogin');
  openSignup = jasmine.createSpy('openSignup');
}

class MockFeedbackService {
  getFeedbacks = jasmine.createSpy('getFeedbacks');
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let modalService: MockModalService;
  let feedbackService: MockFeedbackService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: ModalService, useClass: MockModalService },
        { provide: FeedbackService, useClass: MockFeedbackService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService) as unknown as MockModalService;
    feedbackService = TestBed.inject(FeedbackService) as unknown as MockFeedbackService;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call openSignup() on ModalService when openSignupModal() is called', () => {
    component.openSignupModal();
    expect(modalService.openSignup).toHaveBeenCalledTimes(1);
  });

  it('should call openLogin() on ModalService when openLoginModal() is called', () => {
    component.openLoginModal();
    expect(modalService.openLogin).toHaveBeenCalledTimes(1);
  });

  it('should load feedbacks successfully', () => {
    const fakeFeedbacks = [
      { name: 'Amal', message: 'Great!' },
      { name: 'Nethmi', message: 'Awesome!' }
    ];
    feedbackService.getFeedbacks.and.returnValue(of({ success: true, data: fakeFeedbacks }));

    component.loadFeedbacks();

    expect(feedbackService.getFeedbacks).toHaveBeenCalled();
    expect(component.feedbacks).toEqual(fakeFeedbacks);
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('');
  });

  it('should handle error when loading feedbacks', () => {
    feedbackService.getFeedbacks.and.returnValue(throwError(() => new Error('Network error')));

    component.loadFeedbacks();

    expect(feedbackService.getFeedbacks).toHaveBeenCalled();
    expect(component.feedbacks).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Failed to load feedbacks');
  });
});
