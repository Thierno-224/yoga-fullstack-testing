
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { expect } from '@jest/globals';

import { TeacherService } from './teacher.service';
import { Teacher } from '../models/teacher.interface';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  const apiUrl = 'api/teacher';

  const teacher: Teacher = {
    id: 1,
    firstName: 'Marie',
    lastName: 'Dupont',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TeacherService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all teachers', () => {
    const teachers = [teacher];

    service.all().subscribe(result => {
      expect(result).toEqual(teachers);
    });

    const request = httpMock.expectOne(apiUrl);

    expect(request.request.method).toBe('GET');

    request.flush(teachers);
  });

  it('should retrieve a teacher by ID', () => {
    service.detail('1').subscribe(result => {
      expect(result).toEqual(teacher);
    });

    const request = httpMock.expectOne(`${apiUrl}/1`);

    expect(request.request.method).toBe('GET');

    request.flush(teacher);
  });

  it('should propagate an HTTP error when retrieving teachers fails', () => {
    let receivedStatus: number | undefined;

    service.all().subscribe({
      error: error => {
        receivedStatus = error.status;
      }
    });

    const request = httpMock.expectOne(apiUrl);

    request.flush(
      { message: 'Internal server error' },
      {
        status: 500,
        statusText: 'Internal Server Error'
      }
    );

    expect(receivedStatus).toBe(500);
  });

  it('should propagate an HTTP error when a teacher is not found', () => {
    let receivedStatus: number | undefined;

    service.detail('999').subscribe({
      error: error => {
        receivedStatus = error.status;
      }
    });

    const request = httpMock.expectOne(`${apiUrl}/999`);

    request.flush(
      { message: 'Teacher not found' },
      {
        status: 404,
        statusText: 'Not Found'
      }
    );

    expect(receivedStatus).toBe(404);
  });
});
