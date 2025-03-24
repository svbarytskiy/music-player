import * as d3 from 'd3';
import { Selection } from 'd3';


interface IOptions {
  margin?: { top: number; bottom: number; left: number; right: number };
  height?: number;
  width?: number;
  padding?: number;
}

class Drawer {
  private buffer: AudioBuffer;
  private parent: HTMLElement;
  private cursor: d3.Selection<SVGGElement, unknown, null, undefined>;
  private duration: number;
  private width: number;
  private height: number;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private onSeek: (time: number) => void;
  private updateProgress: (progress: number) => void;

  /**
   * @param buffer Аудіо-буфер
   * @param parent HTML-елемент, куди малюється графік
   * @param onSeek callback, який викликається при перемотці курсором (отримує новий час)
   * @param updateProgress callback для оновлення прогресу
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
    this.updateProgress =
      updateProgress || ((progress) => console.log("Progress updated:", progress));
  }

  // Генеруємо часову шкалу у форматі MM:SS
  private getTimeDomain() {
    const step = 30; // 30 секунд
    const steps = Math.ceil(this.buffer.duration / step);

    return [...new Array(steps)].map((_, index) => {
      const date = new Date(1970, 0, 1, 0, 0, 0, 0);
      date.setSeconds(index * step);
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    });
  }

  // Малюємо курсор (вертикальна лінія з трикутником зверху)
  private drawCursor() {
    this.cursor = this.svg.append('g').attr('class', 'cursor');

    // Вертикальна лінія
    this.cursor
      .append('line')
      .attr('y1', 0)
      .attr('y2', this.height)
      .attr('stroke', '#f50')
      .attr('stroke-width', 2);

    // Трикутник зверху
    this.cursor
      .append('polygon')
      .attr('points', '-6,0 6,0 0,-10')
      .attr('fill', '#f50');

    // Початкове розташування курсору
    this.cursor.attr('transform', `translate(0, 0)`);
  }

  // Додаємо можливість перетягування курсора (drag)
  private enableCursorDragging() {
    const dragHandler = d3
      .drag<SVGGElement, unknown>()
      .on('start',  () => {
        d3.select(this).raise(); // піднімаємо елемент поверх інших
      })
      .on('drag', (event: { x: any; }) => {
        let x = event.x;
        x = Math.max(0, Math.min(x, this.width)); // обмежуємо по межах графіка
        this.cursor.attr('transform', `translate(${x}, 0)`);
        const progress = (x / this.width) * 100;
        this.updateProgress(progress);
      })
      .on('end', (event: { x: any; }) => {
        let x = event.x;
        x = Math.max(0, Math.min(x, this.width));
        const newTime = (x / this.width) * this.duration;
        // Викликаємо callback для перемотки аудіо до нового часу
        this.onSeek(newTime);
      });

    this.cursor.call(dragHandler);
  }

  // Генеруємо хвильову форму та сітку
  public generateWaveform(audioData: number[], options: IOptions = {}) {
    const {
      margin = { top: 40, bottom: 40, left: 0, right: 0 },
      height = this.height,
      width = this.width,
      padding = 5,
    } = options;

    // Зменшуємо кількість барів для продуктивності
    const numBars = this.duration * 2;
    const step = Math.floor(audioData.length / numBars);
    const reducedData = audioData.filter((_, i) => i % step === 0);
    const domain = d3.extent(audioData) as [number, number];

    const xScale = d3
      .scaleLinear()
      .domain([0, reducedData.length - 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain(domain.map((i) => Number(i)))
      .range([margin.top, height - margin.bottom]);

    // Створюємо SVG-елемент
    this.svg = d3
      .create('svg')
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    // Малюємо сітку
    this.svg
      .append('g')
      .attr('stroke-width', 0.5)
      .attr('stroke', '#D6E5D6')
      .call((g) =>
        g
          .append('g')
          .selectAll('line')
          .data(xScale.ticks())
          .join('line')
          .attr('x1', (d: number) => 0.5 + xScale(d))
          .attr('x2', (d: number) => 0.5 + xScale(d))
          .attr('y1', 0)
          .attr('y2', height)
      )
      .call((g) =>
        g
          .append('g')
          .selectAll('line')
          .data(yScale.ticks())
          .join('line')
          .attr('y1', (d: number) => yScale(d))
          .attr('y2', (d: number) => yScale(d))
          .attr('x1', 0)
          .attr('x2', width)
      );

    // Прозорий rect для повного охоплення області (можна використовувати для кліків)
    this.svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'rgba(255, 255, 255, 0)');

    // Група для хвильової форми, центрована по вертикалі
    const g = this.svg
      .append('g')
      .attr('transform', `translate(0, ${height / 2})`)
      .attr('fill', '#f50');

    // Обчислюємо ширину для барів (без margin)
    const availableWidth = width - margin.left - margin.right;
    const numElements = reducedData.length;
    const barWidth = availableWidth / (numElements * 2); // band = barWidth + gap, де gap = barWidth

    g.selectAll('rect')
      .data(reducedData)
      .join('rect')
      .attr('fill', '#ffff')
      .attr('width', barWidth)
      // Обчислюємо висоту як різницю між yScale(d) та yScale(0)
      .attr('height', (d: number) => {
        const barHeight = yScale(d) - yScale(0);
        return Math.abs(barHeight);
      })
      .attr('x', (_: number, i: number) => margin.left + i * (2 * barWidth))
      // Центруємо бар, використовуючи абсолютну висоту
      .attr('y', (d: number) => {
        const barHeight = yScale(d) - yScale(0);
        return -Math.abs(barHeight) / 2;
      })
      .attr('rx', barWidth / 2)
      .attr('ry', barWidth / 2);

    // Малюємо часову шкалу
    const bands = this.getTimeDomain();
    const bandScale = d3.scaleBand().domain(bands).range([margin.top, width]);
    this.svg
      .append('g')
      .call((g) => g.select('.domain').remove())
      .attr('stroke-width', 0)
      .style('color', '#95A17D')
      .style('font-size', 11)
      .style('font-weight', 400)
      .call(d3.axisBottom(bandScale.copy()));

    // Малюємо курсор і додаємо drag
    this.drawCursor();
    this.enableCursorDragging();

    return this.svg;
  }

  // Обробка аудіо-даних для побудови хвильової форми
  public clearData() {
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
    return filteredData.map((n) => n * multiplier);
  }

  // Ініціалізація графіку
  public init() {
    const audioData = this.clearData();
    const node = this.generateWaveform(audioData, {});
    this.parent.appendChild(node.node() as Element);
  }

  public updateCursorPercentage(percentage: number) {
    const x = (this.width * percentage) / 100;
    this.cursor.attr('transform', `translate(${x}, 0)`);
  }
}

export default Drawer;
