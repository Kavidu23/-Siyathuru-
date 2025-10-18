import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommunityService } from './community.service';

describe('CommunityService', () => {
  let service: CommunityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommunityService]
    });

    service = TestBed.inject(CommunityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no open requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request to create a community', () => {
    const mockCommunity = {
      name: 'Youth Leadership Group',
      location: 'Colombo',
      type: 'youth',
      joinType: 'Free'
    };

    const mockResponse = {
      success: true,
      message: 'Community created successfully'
    };

    service.createCommunity(mockCommunity).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(service['baseUrl']);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCommunity);
    req.flush(mockResponse);
  });

  it('should GET all communities', () => {
    const mockCommunities = [
      { name: 'Youth Club', location: 'Colombo', type: 'youth' },
      { name: 'Women Empowerment Hub', location: 'Kandy', type: 'women' }
    ];

    service.getAllCommunities().subscribe(data => {
      expect(data.length).toBe(2);
      expect(data).toEqual(mockCommunities);
    });

    const req = httpMock.expectOne(service['baseUrl']);
    expect(req.request.method).toBe('GET');
    req.flush(mockCommunities);
  });

  it('should GET a community by ID', () => {
    const communityId = '12345';
    const mockCommunity = { name: 'Youth Club', location: 'Colombo', type: 'youth' };

    service.getCommunityById(communityId).subscribe(data => {
      expect(data).toEqual(mockCommunity);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/${communityId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCommunity);
  });
});
