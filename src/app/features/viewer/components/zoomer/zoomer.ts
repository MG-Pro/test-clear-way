import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TuiButton, TuiGroup } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';

@Component({
  selector: 'app-zoomer',
  standalone: true,
  imports: [TuiGroup, TuiButton, TuiBadge],
  templateUrl: './zoomer.html',
  styleUrl: './zoomer.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Zoomer {
  private zoomStep: number = 0.25;
  public currentScale: number = 1;
  public maxScale: number = 1.5;
  public minScale: number = 0.5;

  public zoomChange = output<number>();

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
    this.currentScale = 1;
    this.zoomChange.emit(this.currentScale);
  }
}
