import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../_models/User';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getUserWithRoles() {
    return this.http.get<User[]>(this.baseUrl + 'admin/users-with-roles');
  }

  updateUserRoles(username: string, roles: string[]) {
    return this.http.post<string[]>(this.baseUrl + 'admin/edit-roles/' 
      + username + '?roles=' + roles, {});
  }

  deleteUser(username: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}admin/delete-user/${username}`, {
      responseType: 'text'
    });
  }

  updateUser(user: any) {
    return this.http.put(this.baseUrl + 'admin/users/' + user.username, user, {
      responseType: 'text' // so toastr.success doesn't complain
    });
  }

}
