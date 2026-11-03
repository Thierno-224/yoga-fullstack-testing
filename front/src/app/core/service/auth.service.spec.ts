
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { expect } from '@jest/globals';

import { AuthService } from './auth.service';
import { LoginRequest } from '../models/loginRequest.interface';
import { RegisterRequest } from '../models/registerRequest.interface';
import { SessionInformation } from '../models/sessionInformation.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const apiUrl = '/api/auth';

  const loginRequest: LoginRequest = {
    email: 'marie@example.com',
    password: 'Password123!'
  };

  const registerRequest: RegisterRequest = {
    email: 'marie@example.com',
    firstName: 'Marie',
    lastName: 'Dupont',
    password: 'Password123!'
  };

  const sessionInformation: SessionInformation = {
    id: 1,
    username: 'marie@example.com',
    firstName: 'Marie',
    lastName: 'Dupont',
    admin: false,
    token: 'fake-jwt-token',
    type: 'Bearer'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a new user', () => {
    let completed = false;

    service.register(registerRequest).subscribe({
      complete: () => {
        completed = true;
      }
    });

    const request = httpMock.expectOne(`${apiUrl}/register`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(registerRequest);

    request.flush(null);

    expect(completed).toBe(true);
  });

  it('should login and return session information', () => {
    let receivedSession: SessionInformation | undefined;

    service.login(loginRequest).subscribe(result => {
      receivedSession = result;
    });

    const request = httpMock.expectOne(`${apiUrl}/login`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(loginRequest);

    request.flush(sessionInformation);

    expect(receivedSession).toEqual(sessionInformation);
  });

  it('should propagate a 400 error when registration data is invalid', () => {
    let receivedStatus: number | undefined;

    service.register(registerRequest).subscribe({
      error: error => {
        receivedStatus = error.status;
      }
    });

    const request = httpMock.expectOne(`${apiUrl}/register`);

    request.flush(
      { message: 'Invalid registration data' },
      {
        status: 400,
        statusText: 'Bad Request'
      }
    );

    expect(receivedStatus).toBe(400);
  });

  it('should propagate a 409 error when email already exists', () => {
    let receivedStatus: number | undefined;

    service.register(registerRequest).subscribe({
      error: error => {
        receivedStatus = error.status;
      }
    });

    const request = httpMock.expectOne(`${apiUrl}/register`);

    request.flush(
      { message: 'Email already exists' },
      {
        status: 409,
        statusText: 'Conflict'
      }
    );

    expect(receivedStatus).toBe(409);
  });

  it('should propagate a 401 error when credentials are invalid', () => {
    let receivedStatus: number | undefined;

    service.login(loginRequest).subscribe({
      error: error => {
        receivedStatus = error.status;
      }
    });

    const request = httpMock.expectOne(`${apiUrl}/login`);

    request.flush(
      { message: 'Invalid credentials' },
      {
        status: 401,
        statusText: 'Unauthorized'
      }
    );

    expect(receivedStatus).toBe(401);
  });

  it('should propagate a 500 error when login fails on the server', () => {
    let receivedStatus: number | undefined;

    service.login(loginRequest).subscribe({
      error: error => {
        receivedStatus = error.status;
      }
    });

    const request = httpMock.expectOne(`${apiUrl}/login`);

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
