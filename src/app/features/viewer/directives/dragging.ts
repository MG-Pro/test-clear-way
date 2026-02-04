import { AfterViewInit, Directive, ElementRef, inject, input, output } from '@angular/core';

@Directive({
  selector: '[appDragging]',
  standalone: true,
  host: {
    '(mousedown)': 'onMouseDown($event)',
    '(document:mousemove)': 'onMouseMove($event)',
    '(document:mouseup)': 'onMouseUp()',
  },
})
export class Dragging implements AfterViewInit {
  public dragHandleSelector = input('.drag-handler');
  public dragend = output<{ top: string; left: string }>();

  private container!: HTMLElement;
  private element = inject(ElementRef);
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialLeftPercent = 0;
  private initialTopPercent = 0;

  ngAfterViewInit(): void {
    const { position } = this.element.nativeElement.style;
    if (position === 'static') {
      throw new Error('Host element must have position absolute');
    }

    this.container = this.element.nativeElement.parentElement;
  }

  public onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isHandle = target.closest(this.dragHandleSelector());

    if (!isHandle) {
      return;
    }

    this.isDragging = true;
    const { top, left } = this.element.nativeElement.style;

    this.initialLeftPercent = parseFloat(left);
    this.initialTopPercent = parseFloat(top);

    this.startX = event.clientX;
    this.startY = event.clientY;

    event.preventDefault();
  }

  public onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    const containerRect = this.container.getBoundingClientRect();
    const elementRect = this.element.nativeElement.getBoundingClientRect();

    const deltaXPercent = (deltaX / containerRect.width) * 100;
    const deltaYPercent = (deltaY / containerRect.height) * 100;

    let newLeftPercent = this.initialLeftPercent + deltaXPercent;
    let newTopPercent = this.initialTopPercent + deltaYPercent;

    const elementWidthPercent = (elementRect.width / containerRect.width) * 100;
    const elementHeightPercent = (elementRect.height / containerRect.height) * 100;

    newLeftPercent = Math.max(0, newLeftPercent);
    newLeftPercent = Math.min(100 - elementWidthPercent, newLeftPercent);

    newTopPercent = Math.max(0, newTopPercent);
    newTopPercent = Math.min(100 - elementHeightPercent, newTopPercent);

    this.element.nativeElement.style.left = `${newLeftPercent}%`;
    this.element.nativeElement.style.top = `${newTopPercent}%`;
  }

  public onMouseUp(): void {
    if (this.isDragging) {
      const { top, left } = this.element.nativeElement.style;
      this.dragend.emit({ top, left });
    }

    this.isDragging = false;
  }
}
