import * as d3 from 'd3';

interface IOptions {
    margin?: { top: number; bottom: number; left: number; right: number };
    height?: number;
    width?: number;
    padding?: number;
}

class Drawer {
    private buffer: AudioBuffer;
    private parent: HTMLElement;

    constructor(buffer: AudioBuffer, parent: HTMLElement) {
        this.buffer = buffer;
        this.parent = parent;
    }

    private getTimeDomain() {
        const step = 30; // 30 seconds
        const steps = Math.ceil(this.buffer.duration / step);

        return [...new Array(steps)].map((_, index) => {
            const date = new Date(1970, 0, 1, 0, 0, 0, 0);
            date.setSeconds(index * step);

            let minutes = date.getMinutes().toString();
            if (minutes.length === 1) {
                minutes = `0${minutes}`;
            }

            let seconds = date.getSeconds().toString();
            if (seconds.length === 1) {
                seconds = `0${seconds}`;
            }

            return `${minutes}:${seconds}`;
        });
    }

    public generateWaveform(
        audioData: number[],
        options: IOptions // потрібно описати інтерфейс
    ) {
        const {
            margin = { top: 40, bottom: 40, left: 20, right: 20 },
            height = this.parent.clientHeight,
            width = this.parent.clientWidth,
            padding = 5
        } = options;

        // Зменшуємо кількість барів для продуктивності (можна регулювати)
        const numBars = 1000;
        const step = Math.floor(audioData.length / numBars);
        const reducedData = audioData.filter((_, i) => i % step === 0);
        const domain = d3.extent(audioData);

        const xScale = d3
            .scaleLinear()
            .domain([0, reducedData.length - 1])
            .range([margin.left, width - margin.right]);

        const yScale = d3
            .scaleLinear()
            .domain(domain.map(i => Number(i)))
            .range([margin.top, height - margin.bottom]);

        const svg = d3.create('svg');

        svg
            .style('width', this.parent.clientWidth)
            .style('height', this.parent.clientHeight)
            .style('display', 'block');

        // Малюємо сітку
        svg
            .append('g')
            .attr('stroke-width', 0.5)
            .attr('stroke', '#D6E5D6')
            .call(g =>
                g
                    .append('g')
                    .selectAll('line')
                    .data(xScale.ticks())
                    .join('line')
                    .attr('x1', (d: number) => 0.5 + xScale(d))
                    .attr('x2', (d: number) => 0.5 + xScale(d))
                    .attr('y1', 0)
                    .attr('y2', this.parent.clientHeight)
            )
            .call(g =>
                g
                    .append('g')
                    .selectAll('line')
                    .data(yScale.ticks())
                    .join('line')
                    .attr('y1', (d: number) => yScale(d))
                    .attr('y2', (d: number) => yScale(d))
                    .attr('x1', 0)
                    .attr('x2', this.parent.clientWidth)
            );

        // Прозорий rect для повного охоплення області
        svg
            .append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'rgba(255, 255, 255, 0)');

        // Група для хвильової форми з transform для центрирування по вертикалі
        const g = svg
            .append('g')
            .attr('transform', `translate(0, ${height / 2})`)
            .attr('fill', '#f50');

        // Обчислюємо доступну ширину для барів (без margin)
        const availableWidth = width - margin.left - margin.right;
        const numElements = reducedData.length;
        // Для кожного бару простір (band) = barWidth (сам бар) + gap, де gap = barWidth.
        // Тому barWidth = availableWidth / (numElements * 2)
        const barWidth = availableWidth / (numElements * 2);

        g.selectAll('rect')
            .data(reducedData)
            .join('rect')
            .attr('fill', '#ffff')
            .attr('width', barWidth)
            .attr('height', (d: number) => yScale(d))
            // Розміщуємо кожен бар так, щоб між ними був проміжок, рівний barWidth
            .attr('x', (_: number, i: number) => margin.left + i * (2 * barWidth))
            .attr('y', (d: number) => -yScale(d) / 2)
            .attr('rx', barWidth / 2)
            .attr('ry', barWidth / 2);

        // Часова шкала
        const bands = this.getTimeDomain();
        const bandScale = d3
            .scaleBand()
            .domain(bands)
            .range([margin.top, this.parent.clientWidth]);

        svg
            .append('g')
            .call(g => g.select('.domain').remove())
            .attr('stroke-width', 0)
            .style('color', '#95A17D')
            .style('font-size', 11)
            .style('font-wight', 400)
            .call(d3.axisBottom(bandScale.copy()));

        return svg;
    }

    public clearData() {
        const rawData = this.buffer.getChannelData(0); // працюємо лише з одним каналом
        const samples = this.buffer.sampleRate; // кількість вибірок, яку хочемо отримати
        const blockSize = Math.floor(rawData.length / samples); // кількість вибірок у підрозділі
        const filteredData = [];
        for (let i = 0; i < samples; i += 1) {
            const blockStart = blockSize * i;
            let sum = 0;
            for (let j = 0; j < blockSize; j += 1) {
                sum += Math.abs(rawData[blockStart + j]);
            }
            filteredData.push(sum / blockSize);
        }
        const multiplier = Math.max(...filteredData) ** -1;
        return filteredData.map(n => n * multiplier);
    }

    public init() {
        const audioData = this.clearData();
        const node = this.generateWaveform(audioData, {});
        this.parent.appendChild(node.node() as Element);
    }
}

export default Drawer;
