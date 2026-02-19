import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { AlertComponent } from './alert.component';
import { AlertService } from '../services/alert.service';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let queryParams$: Subject<any>;

  const alertServiceMock = {
    createAlert: jasmine.createSpy('createAlert'),
  };

  beforeEach(async () => {
    queryParams$ = new Subject<any>();

    await TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [
        { provide: AlertService, useValue: alertServiceMock },
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$ } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    alertServiceMock.createAlert.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets communityId from query params', () => {
    queryParams$.next({ communityId: 'c1' });

    expect(component.form.communityId).toBe('c1');
  });

  it('does not create alert when required fields are missing', () => {
    const alertSpy = spyOn(window, 'alert');
    component.form = {
      communityId: 'c1',
      title: '',
      message: '',
      severity: 'info',
      isActive: true,
    };

    component.createAlert();

    expect(alertServiceMock.createAlert).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Title, message and community are required!');
  });

  it('creates alert successfully and resets title/message while keeping communityId', () => {
    alertServiceMock.createAlert.and.returnValue(of({ success: true }));
    const alertSpy = spyOn(window, 'alert');
    component.form = {
      communityId: 'c1',
      title: 'Flood Warning',
      message: 'Heavy rain expected',
      severity: 'warning',
      isActive: true,
    };

    component.createAlert();

    expect(alertServiceMock.createAlert).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Alert created successfully!');
    expect(component.form.communityId).toBe('c1');
    expect(component.form.title).toBe('');
    expect(component.form.message).toBe('');
    expect(component.isLoading).toBeFalse();
  });
});
