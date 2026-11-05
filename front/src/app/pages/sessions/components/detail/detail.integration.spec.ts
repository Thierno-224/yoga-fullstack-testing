
import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  provideRouter
} from '@angular/router';
import {
  RouterTestingHarness
} from '@angular/router/testing';
import {
  NoopAnimationsModule
} from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';

import { DetailComponent } from './detail.component';
import { SessionService } from '../../../../core/service/session.service';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';
import { Session } from '../../../../core/models/session.interface';

describe('DetailComponent integration', () => {
  let httpMock: HttpTestingController;
  let harness: RouterTestingHarness;
  let sessionService: SessionService;

  const user: SessionInformation = {
    id: 2,
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
    date: new Date('2026-12-15'),
    description: 'Morning yoga session',
    teacher_id: 1,
    users: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DetailComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: 'sessions/detail/:id',
            component: DetailComponent
          }
        ])
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);

    sessionService.logIn(user);

    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushTeacher(): void {
    const request = httpMock.expectOne(
      req =>
        req.method === 'GET' &&
        req.url.includes('teacher/1')
    );

    request.flush({
      id: 1,
      firstName: 'John',
      lastName: 'Doe'
    });
  }

  async function loadSession(
    data: Session = session
  ): Promise<DetailComponent> {
    const component = await harness.navigateByUrl(
      '/sessions/detail/10',
      DetailComponent
    );

    const request = httpMock.expectOne(
      req =>
        req.method === 'GET' &&
        req.url.includes('session/10')
    );

    request.flush(data);

    flushTeacher();
    harness.detectChanges();

    return component;
  }

  it('should load session and teacher details', async () => {
    const component = await loadSession();

    expect(component.session?.name).toBe('Morning Yoga');
    expect(component.teacher?.firstName).toBe('John');
    expect(component.isParticipate).toBe(false);

    const text = harness.routeNativeElement?.textContent ?? '';

    expect(text).toContain('Morning Yoga');
    expect(text).toContain('Morning yoga session');
    expect(text).toContain('John');
  });

  it('should participate and refresh session data', async () => {
    const component = await loadSession();

    component.participate();

    const request = httpMock.expectOne(
      req =>
        req.url.includes('session/10/participate/2')
    );

    expect(request.request.method).toBe('POST');

    request.flush(null);

    const refreshRequest = httpMock.expectOne(
      req =>
        req.method === 'GET' &&
        req.url.includes('session/10')
    );

    refreshRequest.flush({
      ...session,
      users: [2]
    });

    flushTeacher();
    harness.detectChanges();

    expect(component.isParticipate).toBe(true);
    expect(component.session?.users).toContain(2);

    expect(
      harness.routeNativeElement?.textContent
    ).toContain('Do not participate');
  });

  it('should cancel participation and refresh session data', async () => {
    const component = await loadSession({
      ...session,
      users: [2]
    });

    expect(component.isParticipate).toBe(true);

    component.unParticipate();

    const request = httpMock.expectOne(
      req =>
        req.url.includes('session/10/participate/2')
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(null);

    const refreshRequest = httpMock.expectOne(
      req =>
        req.method === 'GET' &&
        req.url.includes('session/10')
    );

    refreshRequest.flush({
      ...session,
      users: []
    });

    flushTeacher();
    harness.detectChanges();

    expect(component.isParticipate).toBe(false);
    expect(component.session?.users).toEqual([]);

    expect(
      harness.routeNativeElement?.textContent
    ).toContain('Participate');
  });
});
