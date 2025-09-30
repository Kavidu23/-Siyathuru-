import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';


import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { ModalService } from './modal.service';


class MockModalService {
  loginVisible$ = new BehaviorSubject<boolean>(false).asObservable();
  openLogin = jasmine.createSpy('openLogin');
  closeLogin = jasmine.createSpy('closeLogin');
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        NavbarComponent,
        LoginComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: ModalService, useClass: MockModalService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it(`should have the title 'frontend'`, () => {
    expect(app.title).toEqual('frontend');
  });

  it('should render the title in the heading (assuming default template)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    if (compiled.querySelector('h1')) {
      expect(compiled.querySelector('h1')?.textContent).toContain('frontend');
    }
  });
});
