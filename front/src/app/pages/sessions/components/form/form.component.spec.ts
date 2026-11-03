
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { expect, jest } from '@jest/globals';
import { of } from 'rxjs';

import { FormComponent } from './form.component';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionService } from '../../../../core/service/session.service';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { TeacherService } from '../../../../core/service/teacher.service';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  const session: Session = {
    id: 10,
    name: 'Morning Yoga',
    description: 'A relaxing yoga session',
    date: new Date('2026-11-10'),
    teacher_id: 5,
    users: [],
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-02')
  };

  const teacher: Teacher = {
    id: 5,
    firstName: 'Marie',
    lastName: 'Dupont',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02')
  };

  const sessionApiServiceMock = {
    detail: jest.fn<SessionApiService['detail']>(),
    create: jest.fn<SessionApiService['create']>(),
    update: jest.fn<SessionApiService['update']>()
  };

  const teacherServiceMock = {
    all: jest.fn<TeacherService['all']>()
  };

  const routerMock = {
    navigate: jest.fn<Router['navigate']>(),
    url: '/sessions/create'
  };

  const snackBarMock = {
    open: jest.fn<MatSnackBar['open']>()
  };

  const sessionServiceMock = {
    sessionInformation: {
      id: 1,
      username: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      admin: true,
      token: 'fake-token',
      type: 'Bearer'
    }
  };

  const routeMock = {
    snapshot: {
      paramMap: convertToParamMap({ id: '10' })
    }
  };

  const validForm = {
    name: 'Morning Yoga',
    date: '2026-11-10',
    teacher_id: 5,
    description: 'A relaxing yoga session'
  };

  async function createComponent(
    url = '/sessions/create',
    admin = true
  ): Promise<void> {
    routerMock.url = url;
    sessionServiceMock.sessionInformation.admin = admin;

    await TestBed.configureTestingModule({
      imports: [FormComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    jest.resetAllMocks();

    sessionApiServiceMock.detail.mockReturnValue(of({ ...session }));
    sessionApiServiceMock.create.mockReturnValue(of({ ...session }));
    sessionApiServiceMock.update.mockReturnValue(of({ ...session }));
    teacherServiceMock.all.mockReturnValue(of([{ ...teacher }]));

    routerMock.navigate.mockResolvedValue(true);
  });

  it('should create', async () => {
    await createComponent();

    expect(component).toBeTruthy();
  });

  it('should initialize in create mode', async () => {
    await createComponent();

    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm).toBeDefined();
    expect(sessionApiServiceMock.detail).not.toHaveBeenCalled();
  });

  it('should initialize an invalid empty form', async () => {
    await createComponent();

    expect(component.sessionForm?.invalid).toBe(true);

    expect(component.sessionForm?.get('name')?.hasError('required')).toBe(true);
    expect(component.sessionForm?.get('date')?.hasError('required')).toBe(true);
    expect(component.sessionForm?.get('teacher_id')?.hasError('required')).toBe(true);
    expect(component.sessionForm?.get('description')?.hasError('required')).toBe(true);
  });

  it('should accept a valid form', async () => {
    await createComponent();

    component.sessionForm!.setValue(validForm);

    expect(component.sessionForm?.valid).toBe(true);
  });

  it('should require a session name', async () => {
    await createComponent();

    component.sessionForm!.patchValue({
      ...validForm,
      name: ''
    });

    expect(component.sessionForm?.get('name')?.hasError('required')).toBe(true);
  });

  it('should require a date', async () => {
    await createComponent();

    component.sessionForm!.patchValue({
      ...validForm,
      date: ''
    });

    expect(component.sessionForm?.get('date')?.hasError('required')).toBe(true);
  });

  it('should require a teacher', async () => {
    await createComponent();

    component.sessionForm!.patchValue({
      ...validForm,
      teacher_id: ''
    });

    expect(component.sessionForm?.get('teacher_id')?.hasError('required')).toBe(true);
  });

  it('should require a description', async () => {
    await createComponent();

    component.sessionForm!.patchValue({
      ...validForm,
      description: ''
    });

    expect(component.sessionForm?.get('description')?.hasError('required')).toBe(true);
  });

  it('should validate the numeric maximum for description', async () => {
    await createComponent();

    component.sessionForm!.get('description')!.setValue('2001');

    expect(
      component.sessionForm?.get('description')?.hasError('max')
    ).toBe(true);

    component.sessionForm!.get('description')!.setValue('2000');

    expect(
      component.sessionForm?.get('description')?.hasError('max')
    ).toBe(false);
  });

  it('should load teachers when the component is created', async () => {
    await createComponent();

    expect(teacherServiceMock.all).toHaveBeenCalledTimes(1);
  });

  it('should display available teachers', async () => {
    await createComponent();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Teacher');
  });

  it('should display create session title', async () => {
    await createComponent();

    expect(fixture.nativeElement.querySelector('h1')?.textContent?.trim())
      .toBe('Create session');
  });

  it('should disable save button when form is invalid', async () => {
    await createComponent();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]');

    expect(button.disabled).toBe(true);
  });

  it('should enable save button when form is valid', async () => {
    await createComponent();

    component.sessionForm!.setValue(validForm);
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]');

    expect(button.disabled).toBe(false);
  });

  it('should create a session and navigate to sessions', async () => {
    await createComponent();

    component.sessionForm!.setValue(validForm);
    component.submit();

    expect(sessionApiServiceMock.create).toHaveBeenCalledTimes(1);
    expect(sessionApiServiceMock.create).toHaveBeenCalledWith(validForm);

  });

  it('should submit the form through the HTML', async () => {
    await createComponent();

    component.sessionForm!.setValue(validForm);
    fixture.detectChanges();

    const form: HTMLFormElement =
      fixture.nativeElement.querySelector('form');

    form.dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    }));

    expect(sessionApiServiceMock.create).toHaveBeenCalledWith(validForm);
  });

  it('should initialize in update mode', async () => {
    await createComponent('/sessions/update/10');

    expect(component.onUpdate).toBe(true);
    expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('10');
  });

  it('should prefill the form in update mode', async () => {
    await createComponent('/sessions/update/10');

    expect(component.sessionForm?.get('name')?.value).toBe('Morning Yoga');
    expect(component.sessionForm?.get('date')?.value).toBe('2026-11-10');
    expect(component.sessionForm?.get('teacher_id')?.value).toBe(5);
    expect(component.sessionForm?.get('description')?.value)
      .toBe('A relaxing yoga session');
  });

  it('should display update session title', async () => {
    await createComponent('/sessions/update/10');

    expect(fixture.nativeElement.querySelector('h1')?.textContent?.trim())
      .toBe('Update session');
  });

  it('should update a session and navigate to sessions', async () => {
    await createComponent('/sessions/update/10');

    component.sessionForm!.patchValue({
      name: 'Updated Yoga'
    });

    const expectedSession = component.sessionForm!.value;

    component.submit();

    expect(sessionApiServiceMock.update)
      .toHaveBeenCalledWith('10', expectedSession);


    expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should redirect non-admin users to sessions', async () => {
    await createComponent('/sessions/create', false);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('should render the form fields', async () => {
    await createComponent();

    const html: HTMLElement = fixture.nativeElement;

    expect(html.querySelector('input[formControlName="name"]')).not.toBeNull();
    expect(html.querySelector('input[formControlName="date"]')).not.toBeNull();
    expect(html.querySelector('mat-select[formControlName="teacher_id"]')).not.toBeNull();
    expect(html.querySelector('textarea[formControlName="description"]')).not.toBeNull();
  });
});
