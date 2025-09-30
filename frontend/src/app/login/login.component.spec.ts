import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ModalService } from '../modal.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common'; // Required for LoginComponent's imports

// 1. Mock the ModalService
class MockModalService {
  private subject = new BehaviorSubject<boolean>(false);
  loginVisible$ = this.subject.asObservable();
  closeLogin = jasmine.createSpy('closeLogin');

  emit(value: boolean) {
    this.subject.next(value);
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let modalService: MockModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 🛑 FIX: Since LoginComponent is standalone, move it from declarations to imports.
      // We also need to include CommonModule because LoginComponent imports it.
      imports: [LoginComponent, CommonModule],

      // Provide the MockModalService
      providers: [
        // Use the mock class instead of the real ModalService
        { provide: ModalService, useClass: MockModalService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Retrieve the mock service instance
    // Note: The service is injected into the component constructor, but we retrieve 
    // it from TestBed to interact with the mock.
    modalService = TestBed.inject(ModalService) as unknown as MockModalService;

    // Calls ngOnInit()
    fixture.detectChanges();
  });

  // --- Core Tests ---

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe from ModalService on ngOnDestroy', () => {
    // Arrange: Spy on the unsubscribe method
    const unsubscribeSpy = spyOn(component.subscription, 'unsubscribe');

    // Act: Destroy the component
    component.ngOnDestroy();

    // Assert: Verify that unsubscribe was called
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });

  it('should set isVisible based on the ModalService stream', () => {
    // Arrange: Initial state check
    expect(component.isVisible).toBe(false);

    // Act: Change the service state to true
    modalService.emit(true);

    // Assert: Component should react and update its property
    expect(component.isVisible).toBe(true);
  });

  it('should call closeLogin() on the ModalService when closeLogin() is called', () => {
    // Arrange: Ensure the spy hasn't been called yet
    expect(modalService.closeLogin).not.toHaveBeenCalled();

    // Act
    component.closeLogin();

    // Assert
    expect(modalService.closeLogin).toHaveBeenCalledTimes(1);
  });
});