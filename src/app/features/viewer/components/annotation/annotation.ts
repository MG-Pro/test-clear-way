import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  output,
  signal,
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
  },
  hostDirectives: [
    {
      directive: Dragging,
    },
  ],
})
export class Annotation {
  public annotation = model.required<AnnotationModel>();
  public close = output();

  public text = signal('');

  public top = computed(() => this.annotation()?.y || 0);
  public left = computed(() => this.annotation()?.x || 0);

  constructor() {
    effect(() => {
      this.text.set(this.annotation()?.content ?? '');
    });

    effect(() => {
      this.annotation.update((value) => {
        return { ...value, content: this.text() };
      });
    });

    inject(Dragging).dragend.subscribe((value) => {
      this.update(value);
    });
  }

  public update({ top, left }: { top: string; left: string }) {
    this.annotation.update((annotation) => {
      return { ...annotation, x: parseFloat(left), y: parseFloat(top) };
    });
  }
}
