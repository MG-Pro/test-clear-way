import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { DocumentDataService } from './services/document-data.service';
import { DocumentData } from './models/document-data';
import { ActivatedRoute } from '@angular/router';
import { Observable, shareReplay, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiCard } from '@taiga-ui/layout';
import { NgOptimizedImage, UpperCasePipe } from '@angular/common';
import { Zoomer } from './components/zoomer/zoomer';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [TuiAppearance, TuiCard, UpperCasePipe, NgOptimizedImage, Zoomer],
  providers: [DocumentDataService],
  templateUrl: './viewer.html',
  styleUrl: './viewer.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Viewer implements OnInit {
  private dataService = inject(DocumentDataService);
  private route = inject(ActivatedRoute);
  private zoom: number = 1;
  private initWidth = 1200;
  public width = signal(this.initWidth);
  public documentData = toSignal(this.getDocumentData());

  ngOnInit() {}

  private getDocumentData(): Observable<DocumentData> {
    return this.route.params.pipe(
      switchMap((params) => {
        console.log(params);
        return this.dataService.getDataById(params['id']);
      }),
      shareReplay(),
    );
  }

  public onZoomChange(zoom: number) {
    console.log(zoom);
    this.zoom = zoom;
    this.width.set(this.initWidth * zoom);
  }
}
