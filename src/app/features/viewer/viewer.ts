import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  DestroyRef,
  OnInit,
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
import { Annotation } from './components/annotation/annotation';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [TuiAppearance, TuiCard, UpperCasePipe, NgOptimizedImage, Toolbar, Annotation],
  providers: [DocumentDataService, AnnotationsService],
  templateUrl: './viewer.html',
  styleUrl: './viewer.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Viewer implements OnInit {
  private annotationsService = inject(AnnotationsService);
  private dataService = inject(DocumentDataService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  private readonly initWidth = 1200;

  public width = signal(this.initWidth);
  public documentData = toSignal(this.getDocumentData());
  public annotations = signal<AnnotationModel[]>([]);
  public changed = signal(false);

  public ngOnInit(): void {
    this.getAnnotations();
  }

  public onZoomChange(zoom: number): void {
    this.width.set(this.initWidth * zoom);
  }

  public save(): void {
    const id = this.documentData()?.id;
    if (id) {
      this.dataService
        .saveAnnotations(id, this.annotations())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.getAnnotations();
        });
    }
  }

  public clear(): void {
    this.annotations.set([]);
    this.changed.set(true);
  }

  public onPageClick(event: PointerEvent): void {
    event.preventDefault();
    const container = event.target as HTMLElement;

    if (!container.classList.contains('annotations')) {
      return;
    }

    const { x, y } = this.calculateAnnotationPoint(container, event.clientX, event.clientY);

    const annotation: AnnotationModel = {
      id: Date.now(),
      content: '',
      x,
      y,
    };

    this.annotations.update((annotations) => annotations.concat(annotation));
    this.changed.set(true);
  }

  public onDeleteAnnotation(annotation: AnnotationModel) {
    this.annotations.update((annotations) => annotations.filter(({ id }) => id !== annotation.id));
    this.changed.set(true);
  }

  public onUpdateAnnotation(editable: AnnotationModel) {
    this.annotations.update((annotations) =>
      annotations.map((annotation) => {
        return annotation.id === editable.id ? editable : annotation;
      }),
    );
    this.changed.set(true);
  }

  private getAnnotations(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          return this.dataService.getAnnotationsByDocId(params['id']);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((annotations: AnnotationModel[]) => {
        this.annotations.set(annotations);
        this.changed.set(false);
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

  private calculateAnnotationPoint(container: HTMLElement, clientX: number, clientY: number) {
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
