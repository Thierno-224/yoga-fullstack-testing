
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { expect, jest } from '@jest/globals';
import { of } from 'rxjs';

import { DetailComponent } from './detail.component';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';
import { SessionService } from '../../../../core/service/session.service';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { TeacherService } from '../../../../core/service/teacher.service';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;

  const user: SessionInformation = {
    id: 1,
    username: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false,
    token: 'fake-token',
    type: 'Bearer'
  };

  const session: Session = {
    id: 10,
    name: 'Morning Yoga',
    description: 'A relaxing yoga session',
    date: new Date('2026-11-10'),
    teacher_id: 5,
    users: [2, 3],
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
    delete: jest.fn<SessionApiService['delete']>(),
    participate: jest.fn<SessionApiService['participate']>(),
    unParticipate: jest.fn<SessionApiService['unParticipate']>()
  };

  const teacherServiceMock = {
    detail: jest.fn<TeacherService['detail']>()
  };

  const routerMock = {
    navigate: jest.fn<Router['navigate']>()
  };

  const snackBarMock = {
    open: jest.fn<MatSnackBar['open']>()
  };

  const sessionServiceMock = {
    sessionInformation: { ...user }
  };

  const routeMock = {
    snapshot: {
      paramMap: convertToParamMap({ id: '10' })
    }
  };

  async function createComponent(admin = false): Promise<void> {
    sessionServiceMock.sessionInformation = {
      ...user,
      admin
    };

    await TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    jest.resetAllMocks();

    sessionApiServiceMock.detail.mockReturnValue(of({ ...session }));
    sessionApiServiceMock.delete.mockReturnValue(of(void 0));
    sessionApiServiceMock.participate.mockReturnValue(of(void 0));
    sessionApiServiceMock.unParticipate.mockReturnValue(of(void 0));

    teacherServiceMock.detail.mockReturnValue(of({ ...teacher }));
    routerMock.navigate.mockResolvedValue(true);
  });

  it('should create', async () => {
    await createComponent();

    expect(component).toBeTruthy();
  });

  it('should retrieve the session ID from the route', async () => {
    await createComponent();

    expect(component.sessionId).toBe('10');
    expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('10');
  });

  it('should retrieve the current user ID', async () => {
    await createComponent();

    expect(component.userId).toBe('1');
  });

  it('should load session details on initialization', async () => {
    await createComponent();

    expect(sessionApiServiceMock.detail).toHaveBeenCalledTimes(1);
    expect(component.session).toEqual(session);
  });

  it('should load the teacher associated with the session', async () => {
    await createComponent();

    expect(teacherServiceMock.detail).toHaveBeenCalledWith('5');
    expect(component.teacher).toEqual(teacher);
  });

  it('should identify a user who is not participating', async () => {
    await createComponent();

    expect(component.isParticipate).toBe(false);
  });

  it('should identify a user who is participating', async () => {
    sessionApiServiceMock.detail.mockReturnValue(
      of({ ...session, users: [1, 2, 3] })
    );

    await createComponent();

    expect(component.isParticipate).toBe(true);
  });

  it('should identify a regular user', async () => {
    await createComponent();

    expect(component.isAdmin).toBe(false);
  });

  it('should identify an administrator', async () => {
    await createComponent(true);

    expect(component.isAdmin).toBe(true);
  });

  it('should display the session name and description', async () => {
    await createComponent();

    const html: HTMLElement = fixture.nativeElement;

    expect(html.querySelector('h1')?.textContent?.trim())
      .toBe('Morning Yoga');

    expect(html.querySelector('.description')?.textContent)
      .toContain('A relaxing yoga session');
  });

  it('should display the teacher name', async () => {
    await createComponent();

    fixture.detectChanges();

    const html: HTMLElement = fixture.nativeElement;

    expect(html.textContent).toContain('Marie DUPONT');
  });

  it('should display the number of attendees', async () => {
    await createComponent();

    const html: HTMLElement = fixture.nativeElement;

    expect(html.textContent).toContain('2 attendees');
  });

  it('should display the participate button for a non-participating user', async () => {
    await createComponent();

    const html: HTMLElement = fixture.nativeElement;

    expect(html.textContent).toContain('Participate');
    expect(html.textContent).not.toContain('Do not participate');
    expect(html.textContent).not.toContain('Delete');
  });

  it('should display the unparticipate button for a participating user', async () => {
    sessionApiServiceMock.detail.mockReturnValue(
      of({ ...session, users: [1, 2] })
    );

    await createComponent();

    const html: HTMLElement = fixture.nativeElement;

    expect(html.textContent).toContain('Do not participate');
  });

  it('should display the delete button for an administrator', async () => {
    await createComponent(true);

    const html: HTMLElement = fixture.nativeElement;

    expect(html.textContent).toContain('Delete');
    expect(html.textContent).not.toContain('Participate');
  });

  it('should participate in a session and refresh its details', async () => {
    await createComponent();

    component.participate();

    expect(sessionApiServiceMock.participate)
      .toHaveBeenCalledWith('10', '1');

    expect(sessionApiServiceMock.detail).toHaveBeenCalledTimes(2);
  });

  it('should update participation status after participating', async () => {
    await createComponent();

    sessionApiServiceMock.detail.mockReturnValue(
      of({ ...session, users: [1, 2, 3] })
    );

    component.participate();
    fixture.detectChanges();

    expect(component.isParticipate).toBe(true);
    expect(fixture.nativeElement.textContent)
      .toContain('Do not participate');
  });

  it('should unparticipate from a session and refresh its details', async () => {
    sessionApiServiceMock.detail.mockReturnValue(
      of({ ...session, users: [1, 2] })
    );

    await createComponent();

    component.unParticipate();

    expect(sessionApiServiceMock.unParticipate)
      .toHaveBeenCalledWith('10', '1');

    expect(sessionApiServiceMock.detail).toHaveBeenCalledTimes(2);
  });

  it('should update participation status after unparticipating', async () => {
    sessionApiServiceMock.detail.mockReturnValue(
      of({ ...session, users: [1, 2] })
    );

    await createComponent();

    sessionApiServiceMock.detail.mockReturnValue(
      of({ ...session, users: [2] })
    );

    component.unParticipate();
    fixture.detectChanges();

    expect(component.isParticipate).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Participate');
  });

  it('should trigger participation when clicking the participate button', async () => {
    await createComponent();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );

    const participateButton = buttons.find(button =>
      button.textContent?.trim().includes('Participate')
    );

    expect(participateButton).toBeDefined();

    participateButton!.click();

    expect(sessionApiServiceMock.participate)
      .toHaveBeenCalledWith('10', '1');
  });

  it('should trigger deletion when clicking the delete button', async () => {
    await createComponent(true);

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );

    const deleteButton = buttons.find(button =>
      button.textContent?.includes('Delete')
    );

    expect(deleteButton).toBeDefined();

    deleteButton!.click();

    expect(sessionApiServiceMock.delete)
      .toHaveBeenCalledWith('10');
  });

  it('should go back to the previous page', async () => {
    await createComponent();

    const historySpy = jest.spyOn(window.history, 'back')
      .mockImplementation(() => undefined);

    component.back();

    expect(historySpy).toHaveBeenCalledTimes(1);

    historySpy.mockRestore();
  });
});
