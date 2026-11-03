
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { expect } from '@jest/globals';

import { UserService } from './user.service';
import { User } from '../models/user.interface';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const apiUrl = 'api/user';

  const user: User = {
    id: 1,
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie@example.com',
    admin: false,
    password: 'hashed-password',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve a user by ID', () => {
    let receivedUser: User | undefined;

    service.getById('1').subscribe(result => {
      receivedUser = result;
    });

    const request = httpMock.expectOne(`${apiUrl}/1`);

    expect(request.request.method).toBe('GET');

    request.flush(user);

    expect(receivedUser).toEqual(user);
  });

  it('should delete a user by ID', () => {
    let completed = false;

    service.delete('1').subscribe({
      complete: () => {
        completed = true;
      }
    });

    const request = httpMock.expectOne(`${apiUrl}/1`);

    expect(request.request.method).toBe('DELETE');

    request.flush(null);

    expect(completed).toBe(true);
  });

  it('should propagate a 404 error when user is not found', () => {
    let receivedStatus: number | undefined;

    service.getById('999').subscribe({
      error: error => {
        receivedStatus = error.status;
      }
    });

    const request = httpMock.expectOne(`${apiUrl}/999`);

    request.flush(
      { message: 'User not found' },
      {
        status: 404,
        statusText: 'Not Found'
      }
    );

    expect(receivedStatus).toBe(404);
  });

  it('should propagate a 403 error when deletion is forbidden', () => {
    let receivedStatus: number | undefined;

    service.delete('1').subscribe({
      error: error => {
        receivedStatus = error.status;
      }
    });

    const request = httpMock.expectOne(`${apiUrl}/1`);

    request.flush(
      { message: 'Forbidden' },
      {
        status: 403,
        statusText: 'Forbidden'
      }
    );

    expect(receivedStatus).toBe(403);
  });

  it('should propagate a 500 error when the server fails', () => {
    let receivedStatus: number | undefined;

    service.getById('1').subscribe({
      error: error => {
        receivedStatus = error.status;
      }
    });

    const request = httpMock.expectOne(`${apiUrl}/1`);

    request.flush(
      { message: 'Internal server error' },
      {
        status: 500,
        statusText: 'Internal Server Error'
      }
    );

    expect(receivedStatus).toBe(500);
  });
});
