
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { expect, jest } from '@jest/globals';

import { FormComponent } from './form.component';
import { SessionService } from '../../../../core/service/session.service';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';
import { Session } from '../../../../core/models/session.interface';

@Component({
  standalone: true,
  template: '<h1>Sessions</h1>'
})
class SessionsStubComponent {}

describe('FormComponent integration', () => {
  let httpMock: HttpTestingController;
  let router: Router;
  let harness: RouterTestingHarness;
  let sessionService: SessionService;

  const snackBarMock = {
    open: jest.fn()
  };

  const admin: SessionInformation = {
    id: 1,
    username: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'Yoga',
    admin: true,
    token: 'fake-token',
    type: 'Bearer'
  };

  const session: Session = {
    id: 10,
    name: 'Morning Yoga',
    date: new Date('2026-12-15'),
    teacher_id: 1,
    description: 'Morning yoga session',
    users: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02')
  };

  beforeEach(async () => {
    snackBarMock.open.mockClear();

    TestBed.configureTestingModule({
      imports: [
        FormComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: 'sessions',
            children: [
              {
                path: '',
                component: SessionsStubComponent
              },
              {
                path: 'create',
                component: FormComponent
              },
              {
                path: 'update/:id',
                component: FormComponent
              }
            ]
          }
        ])
      ]
    });

    TestBed.overrideComponent(FormComponent, {
      add: {
        providers: [
          {
            provide: MatSnackBar,
            useValue: snackBarMock
          }
        ]
      }
    });

    await TestBed.compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    sessionService = TestBed.inject(SessionService);

    sessionService.logIn(admin);

    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushTeachers(): void {
    harness.detectChanges();

    const requests = httpMock.match(
      request =>
        request.method === 'GET' &&
        request.url.includes('teacher')
    );

    requests.forEach(request => request.flush([]));
  }

  it('should create a session through the real API service', async () => {
    const component = await harness.navigateByUrl(
      '/sessions/create',
      FormComponent
    );

    const injectedSnackBar =
      harness.routeDebugElement!.injector.get(MatSnackBar);

    expect(injectedSnackBar).toBe(snackBarMock);

    flushTeachers();

    component.sessionForm!.setValue({
      name: 'Yoga Integration Test',
      date: '2026-12-20',
      teacher_id: 1,
      description: 'Created during an integration test'
    });

    expect(component.sessionForm?.valid).toBe(true);

    component.submit();

    const request = httpMock.expectOne(
      req =>
        req.method === 'POST' &&
        req.url.includes('session')
    );

    expect(request.request.body).toEqual({
      name: 'Yoga Integration Test',
      date: '2026-12-20',
      teacher_id: 1,
      description: 'Created during an integration test'
    });

    request.flush(session);

    await harness.fixture.whenStable();

    expect(router.url).toBe('/sessions');

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Session created !',
      'Close',
      { duration: 3000 }
    );
  });

  it('should load and update an existing session', async () => {
    const component = await harness.navigateByUrl(
      '/sessions/update/10',
      FormComponent
    );

    const injectedSnackBar =
      harness.routeDebugElement!.injector.get(MatSnackBar);

    expect(injectedSnackBar).toBe(snackBarMock);

    const detailRequest = httpMock.expectOne(
      req =>
        req.method === 'GET' &&
        req.url.includes('session/10')
    );

    detailRequest.flush(session);

    flushTeachers();

    expect(component.onUpdate).toBe(true);

    expect(component.sessionForm?.get('name')?.value)
      .toBe('Morning Yoga');

    component.sessionForm!.patchValue({
      name: 'Updated Morning Yoga'
    });

    component.submit();

    const updateRequest = httpMock.expectOne(
      req =>
        req.method === 'PUT' &&
        req.url.includes('session/10')
    );

    expect(updateRequest.request.body.name)
      .toBe('Updated Morning Yoga');

    updateRequest.flush({
      ...session,
      name: 'Updated Morning Yoga'
    });

    await harness.fixture.whenStable();

    expect(router.url).toBe('/sessions');

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Session updated !',
      'Close',
      { duration: 3000 }
    );
  });
});
