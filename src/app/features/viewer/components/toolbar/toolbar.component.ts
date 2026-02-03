import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TuiButton, TuiGroup } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';

@Component({
  selector: 'app-zoomer',
  standalone: true,
  imports: [TuiGroup, TuiButton, TuiBadge],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toolbar {
  private initScale = 1;
  private zoomStep: number = 0.25;
  public currentScale: number = 1;
  public maxScale: number = 1.5;
  public minScale: number = 0.5;

  public saveDisabled = input.required<boolean>();
  public zoomChange = output<number>();
  public onSave = output();
  public onClear = output();

  protected zoomIn() {
    if (this.currentScale < this.maxScale) {
      this.currentScale = Math.min(this.maxScale, this.currentScale + this.zoomStep);
      this.zoomChange.emit(this.currentScale);
    }
  }

  protected zoomOut() {
    if (this.currentScale > this.minScale) {
      this.currentScale = Math.max(this.minScale, this.currentScale - this.zoomStep);
      this.zoomChange.emit(this.currentScale);
    }
  }

  protected resetZoom() {
    this.currentScale = this.initScale;
    this.zoomChange.emit(this.currentScale);
  }
}
