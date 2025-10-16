import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FeedbackService]
    });
    service = TestBed.inject(FeedbackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST feedback', () => {
    const mockFeedback = { userId: '1', name: 'Kevin', message: 'Great platform!' };
    const mockResponse = { ...mockFeedback, _id: 'abc123', createdAt: '2025-10-16T10:00:00Z' };

    service.createFeedback(mockFeedback).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(service['baseUrl']);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should GET all feedbacks', () => {
    const mockFeedbacks = [
      { _id: '1', userId: '1', name: 'Kevin', message: 'Great platform!' },
      { _id: '2', userId: '2', name: 'Alice', message: 'Loved it!' }
    ];

    service.getFeedbacks().subscribe(res => {
      expect(res).toEqual(mockFeedbacks);
    });

    const req = httpMock.expectOne(service['baseUrl']);
    expect(req.request.method).toBe('GET');
    req.flush(mockFeedbacks);
  });
});
