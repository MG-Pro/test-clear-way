import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DocumentModel } from '../models/document.model';
import { map, Observable, of } from 'rxjs';
import { AnnotationModel } from '../models/annotation.model';

@Injectable()
export class DocumentDataService {
  private httpClient = inject(HttpClient);

  public getDocumentById(id: string): Observable<DocumentModel> {
    return this.httpClient.get<DocumentModel>(`./${id}.json`).pipe(
      map((data) => ({
        ...data,
        id,
      })),
    );
  }

  public saveAnnotations(id: string, annotations: AnnotationModel[]): Observable<void> {
    localStorage.setItem(id, JSON.stringify(annotations));
    return of(void 0);
  }

  public getAnnotationsByDocId(id: string): Observable<AnnotationModel[]> {
    try {
      return of(JSON.parse(localStorage.getItem(id) ?? '') ?? []);
    } catch (error) {
      return of([]);
    }
  }
}
