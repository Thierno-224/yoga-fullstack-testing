
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { expect } from '@jest/globals';

import { ListComponent } from './list.component';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';
import { Session } from '../../../../core/models/session.interface';

@Component({
  standalone: true,
  template: '<h1>Destination</h1>'
})
class DestinationComponent {}

describe('ListComponent integration', () => {
  let httpMock: HttpTestingController;
  let router: Router;
  let sessionService: SessionService;
  let harness: RouterTestingHarness;

  const admin: SessionInformation = {
    id: 1,
    username: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'Yoga',
    admin: true,
    token: 'fake-admin-token',
    type: 'Bearer'
  };

  const regularUser: SessionInformation = {
    ...admin,
    id: 2,
    username: 'user@example.com',
    admin: false,
    token: 'fake-user-token'
  };

  const sessions: Session[] = [
    {
      id: 10,
      name: 'Morning Yoga',
      date: new Date('2026-12-15'),
      description: 'Morning yoga session',
      teacher_id: 1,
      users: [],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02')
    },
    {
      id: 20,
      name: 'Evening Yoga',
      date: new Date('2026-12-16'),
      description: 'Evening yoga session',
      teacher_id: 2,
      users: [],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02')
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        SessionApiService,
        SessionService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: 'sessions',
            children: [
              { path: '', component: ListComponent },
              { path: 'create', component: DestinationComponent },
              { path: 'detail/:id', component: DestinationComponent },
              { path: 'update/:id', component: DestinationComponent }
            ]
          }
        ])
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    sessionService = TestBed.inject(SessionService);

    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    httpMock.verify();
  });

  async function renderList(
    user: SessionInformation = admin,
    data: Session[] = sessions
  ): Promise<void> {
    sessionService.logIn(user);

    await harness.navigateByUrl('/sessions', ListComponent);

    const request = httpMock.expectOne('api/session');

    expect(request.request.method).toBe('GET');

    request.flush(data);

    harness.detectChanges();
  }

  function html(): HTMLElement {
    return harness.routeNativeElement as HTMLElement;
  }

  function clickButton(selector: string): void {
    const element = html().querySelector<HTMLElement>(selector);

    expect(element).not.toBeNull();

    element!.click();

    harness.detectChanges();
  }

  it('should load sessions from the real API service', async () => {
    await renderList();

    expect(html().textContent).toContain('Morning Yoga');
    expect(html().textContent).toContain('Evening Yoga');
  });

  it('should display session names and descriptions', async () => {
    await renderList();

    expect(html().textContent).toContain('Morning Yoga');
    expect(html().textContent).toContain('Morning yoga session');
    expect(html().textContent).toContain('Evening Yoga');
    expect(html().textContent).toContain('Evening yoga session');
  });

  it('should display no session cards when API returns empty list', async () => {
    await renderList(admin, []);

    expect(
      html().querySelectorAll('mat-card.item').length
    ).toBe(0);
  });

  it('should navigate to session details', async () => {
    await renderList();

    clickButton('[data-cy="btn-detail"]');

    await harness.fixture.whenStable();

    expect(router.url).toBe('/sessions/detail/10');
  });

  it('should navigate to create session', async () => {
    await renderList(admin);

    clickButton('[data-cy="btn-create"]');

    await harness.fixture.whenStable();

    expect(router.url).toBe('/sessions/create');
  });

  it('should navigate to update session', async () => {
    await renderList(admin);

    clickButton('[data-cy="btn-edit"]');

    await harness.fixture.whenStable();

    expect(router.url).toBe('/sessions/update/10');
  });
});
