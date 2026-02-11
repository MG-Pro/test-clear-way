import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { AnnotationModel } from '../../models/annotation.model';
import { TuiButtonClose, TuiTextarea } from '@taiga-ui/kit';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { Dragging } from '../../directives/dragging';

@Component({
  selector: 'app-annotation',
  standalone: true,
  imports: [TuiButtonClose, TuiButton, TuiTextfield, TuiTextarea, TuiIcon, FormsModule],
  templateUrl: './annotation.html',
  styleUrl: './annotation.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.top.%]': 'top()',
    '[style.left.%]': 'left()',
    '(onDragend)': 'updatePoint($event)',
  },
  hostDirectives: [
    {
      directive: Dragging,
      inputs: ['dragHandleSelector'],
      outputs: ['onDragend'],
    },
  ],
})
export class Annotation {
  public annotation = input.required<AnnotationModel>();

  public text = signal('');

  public top = computed(() => this.annotation()?.y || 0);
  public left = computed(() => this.annotation()?.x || 0);
  public onDelete = output<AnnotationModel>();
  public onUpdate = output<AnnotationModel>();

  constructor() {
    effect(() => {
      this.text.set(this.annotation()?.content ?? '');
    });

    effect(() => {
      const annotation = untracked(this.annotation);

      this.onUpdate.emit({
        ...annotation,
        content: this.text(),
      });
    });
  }

  protected updatePoint(value: { top: string; left: string }) {
    this.onUpdate.emit({
      ...this.annotation(),
      x: parseFloat(value.left),
      y: parseFloat(value.top),
    });
  }
}
