import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly pathService = 'api/user';

  private httpClient = inject(HttpClient);

  public getById(id: string): Observable<User> {
    return this.httpClient.get<User>(`${this.pathService}/${id}`);
  }

  public delete(id: string): Observable<any> {
    return this.httpClient.delete(`${this.pathService}/${id}`);
  }
}
