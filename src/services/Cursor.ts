import * as d3 from 'd3';
import { Selection } from 'd3-selection';
import { drag, D3DragEvent } from 'd3-drag';

export class Cursor {
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private cursor: Selection<SVGGElement, unknown, null, undefined>;
  private width: number;
  private height: number;
  private duration: number;
  private onSeek: (time: number) => void;
  private updateProgress: (progress: number) => void;

  constructor(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number,
    duration: number,
    onSeek: (time: number) => void,
    updateProgress: (progress: number) => void
  ) {
    this.svg = svg;
    this.width = width;
    this.height = height;
    this.duration = duration;
    this.onSeek = onSeek;
    this.updateProgress = updateProgress;
    this.cursor = this.drawCursor();
    this.enableCursorDragging();
  }

  private drawCursor(): Selection<SVGGElement, unknown, null, undefined> {
    const cursor = this.svg.append('g').attr('class', 'cursor');

    cursor.append('line')
      .attr('y1', 0)
      .attr('y2', this.height)
      .attr('stroke', '#f50')
      .attr('stroke-width', 2);

    cursor.append('polygon')
      .attr('points', '-8,0 8,0 0,10')
      .attr('fill', '#f50');

    cursor.append('polygon')
      .attr('points', '-8,0 8,0 0,-10')
      .attr('transform', `translate(0, ${this.height})`)
      .attr('fill', '#f50');

    cursor.attr('transform', 'translate(0, 0)');
    return cursor;
  }

  private enableCursorDragging(): void {
    const dragHandler = drag<SVGGElement, unknown>()
      .on('start', function (this: SVGGElement) {
        d3.select(this).raise();
      })
      .on('drag', (event: D3DragEvent<SVGGElement, unknown, unknown>) => {
        let x = event.x;
        x = Math.max(0, Math.min(x, this.width));
        this.cursor.attr('transform', `translate(${x}, 0)`);
        const progress = (x / this.width) * 100;
        this.updateProgress(progress);
      })
      .on('end', (event: D3DragEvent<SVGGElement, unknown, unknown>) => {
        let x = event.x;
        x = Math.max(0, Math.min(x, this.width));
        const newTime = (x / this.width) * this.duration;
        this.onSeek(newTime);
      });
    
    this.cursor.call(dragHandler);
  }

  public updateCursorPercentage(percentage: number): void {
    const x = (this.width * percentage) / 100;
    this.cursor.attr('transform', `translate(${x}, 0)`);
  }
}
