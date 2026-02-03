import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  model,
  output,
  signal,
} from '@angular/core';
import { AnnotationModel } from '../../models/annotation.model';
import { TuiButtonClose, TuiTextarea } from '@taiga-ui/kit';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-annotation',
  standalone: true,
  imports: [TuiButtonClose, TuiButton, TuiTextfield, TuiTextarea, TuiIcon, FormsModule],
  templateUrl: './annotation.html',
  styleUrl: './annotation.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.top.px]': 'top()',
    '[style.left.px]': 'left()',
  },
})
export class Annotation {
  public annotation = model.required<AnnotationModel>();

  public top = computed(() => this.annotation()?.y || 0);
  public left = computed(() => this.annotation()?.x || 0);

  public close = output();

  public text = signal('');

  constructor() {
    effect(() => {
      this.text.set(this.annotation()?.content ?? '');
    });

    effect(() => {
      this.annotation.update((value) => {
        return { ...value, content: this.text() };
      });
    });
  }
}
