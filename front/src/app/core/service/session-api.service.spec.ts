
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { expect } from '@jest/globals';

import { SessionApiService } from './session-api.service';
import { Session } from '../models/session.interface';

describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  const apiUrl = 'api/session';

  const session: Session = {
    id: 1,
    name: 'Morning Yoga',
    description: 'A relaxing yoga session',
    date: new Date('2026-11-10'),
    teacher_id: 2,
    users: [1, 3],
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-02')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SessionApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all sessions', () => {
    const sessions = [session];

    service.all().subscribe(result => {
      expect(result).toEqual(sessions);
    });

    const request = httpMock.expectOne(apiUrl);

    expect(request.request.method).toBe('GET');

    request.flush(sessions);
  });

  it('should retrieve a session by ID', () => {
    service.detail('1').subscribe(result => {
      expect(result).toEqual(session);
    });

    const request = httpMock.expectOne(`${apiUrl}/1`);

    expect(request.request.method).toBe('GET');

    request.flush(session);
  });

  it('should create a session', () => {
    service.create(session).subscribe(result => {
      expect(result).toEqual(session);
    });

    const request = httpMock.expectOne(apiUrl);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(session);

    request.flush(session);
  });

  it('should update a session', () => {
    const updatedSession = {
      ...session,
      name: 'Updated Yoga'
    };

    service.update('1', updatedSession).subscribe(result => {
      expect(result).toEqual(updatedSession);
    });

    const request = httpMock.expectOne(`${apiUrl}/1`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(updatedSession);

    request.flush(updatedSession);
  });

  it('should delete a session', () => {
    service.delete('1').subscribe(result => {
      expect(result).toBeNull();
    });

    const request = httpMock.expectOne(`${apiUrl}/1`);

    expect(request.request.method).toBe('DELETE');

    request.flush(null);
  });

  it('should participate in a session', () => {
    service.participate('1', '3').subscribe(result => {
      expect(result).toBeNull();
    });

    const request = httpMock.expectOne(
      `${apiUrl}/1/participate/3`
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();

    request.flush(null);
  });

  it('should unparticipate from a session', () => {
    service.unParticipate('1', '3').subscribe(result => {
      expect(result).toBeNull();
    });

    const request = httpMock.expectOne(
      `${apiUrl}/1/participate/3`
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(null);
  });

  it('should propagate an HTTP error', () => {
    service.detail('999').subscribe({
      next: () => {
        throw new Error('Expected an HTTP error');
      },
      error: error => {
        expect(error.status).toBe(404);
      }
    });

    const request = httpMock.expectOne(`${apiUrl}/999`);

    request.flush(
      { message: 'Session not found' },
      {
        status: 404,
        statusText: 'Not Found'
      }
    );
  });
});
