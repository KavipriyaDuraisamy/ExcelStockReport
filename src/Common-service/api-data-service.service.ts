import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiDataServiceService {
  APIURL: any="";

  constructor(private http:HttpClient) { }

  GET(path: string): any {
    this.APIURL = `${environment.APIURL}${path}`;
    return this.http.get<any>(this.APIURL).pipe(map(result => {
      return result;
    }));
  };

  POST(path: string, json: any): any {
    this.APIURL = `${environment.APIURL}${path}`;
    return this.http.post<any>(this.APIURL, json).pipe(map(result => {
      return result;
    }));
  };
}
