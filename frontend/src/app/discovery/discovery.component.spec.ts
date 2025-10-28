import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscoveryComponent } from './discovery.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('DiscoveryComponent', () => {
  let component: DiscoveryComponent;
  let fixture: ComponentFixture<DiscoveryComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoveryComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DiscoveryComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter communities by type', () => {
    component.selectedType = 'youth';
    component.applyFilters();
    expect(component.filteredCommunities.length).toBe(1);
    expect(component.filteredCommunities[0].name).toBe('Youth Leadership Group');
  });

  it('should filter communities by join type', () => {
    component.selectedJoinType = 'Free';
    component.applyFilters();
    expect(component.filteredCommunities.every(c => c.joinType === 'Free')).toBeTrue();
  });

  it('should return no suggestions if search query is less than 3 chars', () => {
    component.searchQuery = 'co';
    component.onLocationSearch();
    expect(component.locationSuggestions.length).toBe(0);
  });

  it('should update searchQuery and clear suggestions on selectLocation', () => {
    const suggestion = { display_name: 'Kandy, Sri Lanka', lat: '7.2906', lon: '80.6337' };
    component.selectLocation(suggestion);
    expect(component.searchQuery).toBe('Kandy, Sri Lanka');
    expect(component.locationSuggestions.length).toBe(0);
  });
});
