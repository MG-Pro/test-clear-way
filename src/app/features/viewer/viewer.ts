import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  DestroyRef,
  ViewContainerRef,
  viewChildren,
  effect,
} from '@angular/core';
import { DocumentDataService } from './services/document-data.service';
import { DocumentModel } from './models/document.model';
import { ActivatedRoute } from '@angular/router';
import { Observable, shareReplay, switchMap } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiCard } from '@taiga-ui/layout';
import { NgOptimizedImage, UpperCasePipe } from '@angular/common';
import { Toolbar } from './components/toolbar/toolbar.component';
import { AnnotationsService } from './services/annotations.service';
import { AnnotationModel } from './models/annotation.model';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [TuiAppearance, TuiCard, UpperCasePipe, NgOptimizedImage, Toolbar],
  providers: [DocumentDataService, AnnotationsService],
  templateUrl: './viewer.html',
  styleUrl: './viewer.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Viewer {
  private dataService = inject(DocumentDataService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  public annotationsService = inject(AnnotationsService);

  private readonly initWidth = 1200;
  public width = signal(this.initWidth);
  public documentData = toSignal(this.getDocumentData());

  private pages = viewChildren('page', { read: ViewContainerRef });
  private routeParams = toSignal(this.route.params);

  constructor() {
    effect(() => {
      if (this.pages().length && this.routeParams()?.['id']) {
        this.dataService
          .getAnnotationsByDocId(this.routeParams()?.['id'])
          .pipe()
          .subscribe((annotations: AnnotationModel[]) => {
            this.annotationsService.addAnnotations(annotations, this.pages());
            this.annotationsService.resetChanged();
          });
      }
    });
  }

  private getDocumentData(): Observable<DocumentModel> {
    return this.route.params.pipe(
      switchMap((params) => {
        return this.dataService.getDocumentById(params['id']);
      }),
      shareReplay(),
    );
  }

  public onZoomChange(zoom: number) {
    this.width.set(this.initWidth * zoom);
  }

  public save(): void {
    const annotations = this.annotationsService.getAnnotations();
    const id = this.documentData()?.id;
    if (id) {
      this.dataService
        .saveAnnotations(id, annotations)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.annotationsService.resetChanged();
        });
    }
  }

  public clear(): void {
    this.annotationsService.clearAnnotations();
  }

  public onPageClick(event: PointerEvent, id: number): void {
    event.preventDefault();
    const container = event.target as HTMLElement;

    if (!container.classList.contains('annotations')) {
      return;
    }

    const { x, y } = this.calculateAnnotationPoint(container, event.clientX, event.clientY);

    const annotation: AnnotationModel = {
      pageId: id,
      content: '',
      x,
      y,
    };

    this.annotationsService.addAnnotations([annotation], this.pages());
  }

  private calculateAnnotationPoint(
    container: HTMLElement,
    clientX: number,
    clientY: number,
  ): Record<string, number> {
    const rect = container.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const percentX = parseFloat(((x / rect.width) * 100).toFixed(2));
    const percentY = parseFloat(((y / rect.height) * 100).toFixed(2));

    return {
      x: percentX,
      y: percentY,
    };
  }
}
