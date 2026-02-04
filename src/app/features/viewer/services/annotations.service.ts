import {
  ComponentRef,
  inject,
  Injectable,
  Injector,
  signal,
  ViewContainerRef,
} from '@angular/core';
import { Annotation } from '../components/annotation/annotation';
import { AnnotationModel } from '../models/annotation.model';

@Injectable()
export class AnnotationsService {
  private injector = inject(Injector);
  private componentRefs = new Set<ComponentRef<Annotation>>();

  public changed = signal(false);

  public resetChanged(): void {
    this.changed.set(false);
  }

  public getAnnotations(): AnnotationModel[] {
    return Array.from(this.componentRefs).map((c) => c.instance.annotation());
  }

  public addAnnotations(annotations: AnnotationModel[], pages: readonly ViewContainerRef[]): void {
    annotations.forEach((annotation) => {
      const annotationsContainer: ViewContainerRef | undefined = pages.find((ref) => {
        return (
          ref.element.nativeElement.getAttribute('data-item-id') === annotation.pageId.toString()
        );
      });

      if (annotationsContainer) {
        this.createAnnotation(annotationsContainer, annotation);
      }
    });
  }

  public clearAnnotations(): void {
    this.componentRefs.forEach((component) => {
      this.destroyAnnotation(component);
    });
    this.componentRefs.clear();
  }

  private createAnnotation(container: ViewContainerRef, data: AnnotationModel): Annotation | null {
    const componentRef = container.createComponent(Annotation, {
      injector: this.injector,
    });

    if (componentRef.instance) {
      componentRef.instance.annotation.set(data);
      componentRef.instance.close.subscribe(() => {
        this.destroyAnnotation(componentRef);
      });

      componentRef.instance.annotation.subscribe((value) => {
        this.changed.set(true);
      });

      const hostElement = container.element.nativeElement;
      const childElement = componentRef.location.nativeElement;
      hostElement.appendChild(childElement);
      componentRef.changeDetectorRef.detectChanges();
      this.componentRefs.add(componentRef);
      return componentRef.instance;
    }

    return null;
  }

  private destroyAnnotation(component: ComponentRef<Annotation> | null): void {
    if (component) {
      component.destroy();
      this.componentRefs.delete(component);
      component = null;
      this.changed.set(true);
    }
  }
}
