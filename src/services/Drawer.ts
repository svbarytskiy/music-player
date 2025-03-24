import * as d3 from 'd3';
import { Selection } from 'd3-selection';
import { drag, D3DragEvent } from 'd3-drag';

interface IOptions {
  margin?: { top: number; bottom: number; left: number; right: number };
  height?: number;
  width?: number;
  padding?: number;
}

class Drawer {
  private buffer: AudioBuffer;
  private parent: HTMLElement;
  private cursor!: Selection<SVGGElement, unknown, null, undefined>;
  private duration: number;
  private width: number;
  private height: number;
  private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
  private onSeek: (time: number) => void;
  private updateProgress: (progress: number) => void;

  /**
   * @param buffer Аудіо-буфер
   * @param parent HTML-елемент для рендерингу графіку
   * @param onSeek Callback для перемотування аудіо
   * @param updateProgress Callback для оновлення прогресу
   */
  constructor(
    buffer: AudioBuffer,
    parent: HTMLElement,
    onSeek?: (time: number) => void,
    updateProgress?: (progress: number) => void
  ) {
    this.buffer = buffer;
    this.parent = parent;
    this.duration = buffer.duration;
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;
    this.onSeek = onSeek || ((time) => console.log("New time:", time));
    this.updateProgress = updateProgress || ((progress) => console.log("New progress:", progress));
  }

  private getTimeDomain(): string[] {
    const step = 30;
    const steps = Math.ceil(this.duration / step);
    return [...new Array(steps)].map((_, index) => {
      const date = new Date(1970, 0, 1);
      date.setSeconds(index * step);
      return `${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    });
  }

  private drawCursor(): void {
    this.cursor = this.svg.append('g').attr('class', 'cursor');

    this.cursor.append('line')
      .attr('y1', 0)
      .attr('y2', this.height)
      .attr('stroke', '#f50')
      .attr('stroke-width', 2);

    this.cursor.append('polygon')
      .attr('points', '-8,0 8,0 0,10')
      .attr('fill', '#f50');

    this.cursor.append('polygon')
      .attr('points', '-8,0 8,0 0,-10')
      .attr('transform', `translate(0, ${this.height})`)
      .attr('fill', '#f50');
    this.cursor.attr('transform', `translate(0, 0)`);
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

  public generateWaveform(audioData: number[], options: IOptions = {}): Selection<SVGSVGElement, unknown, null, undefined> {
    const {
      margin = { top: 40, bottom: 40, left: 0, right: 0 },
      height = this.height,
      width = this.width,
      // padding = 5,
    } = options;

    const numBars = this.duration * 2;
    const step = Math.floor(audioData.length / numBars);
    const reducedData = audioData.filter((_, i) => i % step === 0);
    const domain = d3.extent(audioData) as [number, number];

    const xScale = d3.scaleLinear()
      .domain([0, reducedData.length - 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain(domain.map(n => Number(n)))
      .range([margin.top, height - margin.bottom]);

    this.svg = d3.create('svg')
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    this.svg.append('g')
      .attr('stroke-width', 0.5)
      .attr('stroke', '#D6E5D6')
      .call(g => {
        g.append('g')
          .selectAll('line')
          .data<number>(xScale.ticks())
          .join('line')
          .attr('x1', (d: number) => 0.5 + xScale(d))
          .attr('x2', (d: number) => 0.5 + xScale(d))
          .attr('y1', 0)
          .attr('y2', height);
      })
      .call(g => {
        g.append('g')
          .selectAll('line')
          .data<number>(yScale.ticks())
          .join('line')
          .attr('y1', (d: number) => yScale(d))
          .attr('y2', (d: number) => yScale(d))
          .attr('x1', 0)
          .attr('x2', width);
      });

    this.svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'rgba(255, 255, 255, 0)');

    const g = this.svg.append('g')
      .attr('transform', `translate(0, ${height / 2})`)
      .attr('fill', '#f50');

    const availableWidth = width - margin.left - margin.right;
    const numElements = reducedData.length;
    const barWidth = availableWidth / (numElements * 2);

    g.selectAll('rect')
      .data(reducedData)
      .join('rect')
      .attr('fill', '#ffff')
      .attr('width', barWidth)
      .attr('height', (d: number) => {
        const barHeight = yScale(d) - yScale(0);
        return Math.abs(barHeight);
      })
      .attr('x', (_: number, i: number) => margin.left + i * (2 * barWidth))
      .attr('y', (d: number) => {
        const barHeight = yScale(d) - yScale(0);
        return -Math.abs(barHeight) / 2;
      })
      .attr('rx', barWidth / 2)
      .attr('ry', barWidth / 2);

    const bands = this.getTimeDomain();
    const bandScale = d3.scaleBand().domain(bands).range([margin.top, width]);
    this.svg.append('g')
      .call(g => g.select('.domain').remove())
      .attr('stroke-width', 0)
      .style('color', '#95A17D')
      .style('font-size', 11)
      .style('font-weight', 400)
      .call(d3.axisBottom(bandScale.copy()));

    this.drawCursor();
    this.enableCursorDragging();

    return this.svg;
  }

  public clearData(): number[] {
    const rawData = this.buffer.getChannelData(0);
    const samples = this.buffer.sampleRate;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData: number[] = [];
    for (let i = 0; i < samples; i++) {
      const blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j]);
      }
      filteredData.push(sum / blockSize);
    }
    const multiplier = Math.max(...filteredData) ** -1;
    return filteredData.map(n => n * multiplier);
  }

  public init(): void {
    const audioData = this.clearData();
    const node = this.generateWaveform(audioData, {});
    this.parent.appendChild(node.node() as Element);
  }

  public updateCursorPercentage(percentage: number): void {
    const x = (this.width * percentage) / 100;
    this.cursor.attr('transform', `translate(${x}, 0)`);
  }
}

export default Drawer;