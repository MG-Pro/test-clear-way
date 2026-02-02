import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DocumentData } from '../models/document-data';
import { map, Observable } from 'rxjs';

@Injectable()
export class DocumentDataService {
  private httpClient = inject(HttpClient);

  public getDataById(id: string): Observable<DocumentData> {
    return this.httpClient.get<DocumentData>(`./${id}.json`).pipe(map((data) => data));
  }
}
