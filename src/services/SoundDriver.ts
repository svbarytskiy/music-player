import Drawer from './Drawer';

class SoundDriver {
  private readonly audioFile: Blob;
  private drawer?: Drawer;
  private context: AudioContext;
  private gainNode: GainNode;
  private audioBuffer?: AudioBuffer;
  private bufferSource?: AudioBufferSourceNode | null;
  private startedAt = 0;
  private pausedAt = 0;
  private isRunning = false;

  constructor(audioFile: Blob) {
    this.audioFile = audioFile;
    this.context = new AudioContext();
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
  }

  public getBuffer() {
    return this.audioBuffer;
  }

  public getCurrentTime() {
    return this.isRunning ? this.context.currentTime - this.startedAt : this.pausedAt;
  }

  public init(parent: HTMLElement | null) {
    return new Promise((resolve, reject) => {
      if (!parent) {
        reject(new Error('Parent element not found'));
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(this.audioFile);
      reader.onload = (event: ProgressEvent<FileReader>) =>
        this.loadSound(event).then(buffer => {
          this.audioBuffer = buffer;
          this.drawer = new Drawer(buffer, parent);
          resolve(undefined);
        });
      reader.onerror = reject;
    });
  }

  private loadSound(readerEvent: ProgressEvent<FileReader>) {
    if (!readerEvent?.target?.result) {
      throw new Error('Can not read file');
    }
    return this.context.decodeAudioData(readerEvent.target.result as ArrayBuffer);
  }

  public async play() {
    if (!this.audioBuffer || this.isRunning) {
      return;
    }

    // Створюємо новий AudioBufferSourceNode щоразу
    this.bufferSource = this.context.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;
    this.bufferSource.connect(this.gainNode);

    await this.context.resume();
    // Викликаємо start з параметрами: час старту 0, а відлік від pausedAt
    this.bufferSource.start(0, this.pausedAt);

    this.startedAt = this.context.currentTime - this.pausedAt;
    this.pausedAt = 0;
    this.isRunning = true;

    this.updateCursorLoop();
  }

  private updateCursorLoop() {
    const update = () => {
      if (!this.isRunning) return;
      if (!this.audioBuffer) return;
      const currentTime = this.getCurrentTime();
      const percentage = (currentTime / this.audioBuffer.duration) * 100;

      if (percentage >= 100) {
        this.isRunning = false;
        this.pause();
        return;
      }

      if (this.drawer) {
        this.drawer.updateCursorPercentage(percentage);
      }

      if (this.isRunning) {
        requestAnimationFrame(update);
      }
    };
    update();
  }

  public async pause(reset?: boolean) {
    if (!this.bufferSource) {
      throw new Error('Pause error: bufferSource does not exist.');
    }

    await this.context.suspend();

    this.pausedAt = reset ? 0 : this.context.currentTime - this.startedAt;
    this.bufferSource.stop();
    this.bufferSource.disconnect();
    // Очищуємо посилання, щоб уникнути повторного використання одного і того ж вузла
    this.bufferSource = null;
    this.isRunning = false;
  }

  public changeVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    console.log("Changing volume to:", clamped);
    this.gainNode.gain.setValueAtTime(clamped, this.context.currentTime);
  }

  public setCurrentTime(time: number) {
    if (!this.audioBuffer) return;

    this.pausedAt = time;

    if (this.isRunning) {
      this.pause().then(() => this.play());
    }
  }

  public async setCurrentTimeByPercentage(percentage: number) {
    if (!this.audioBuffer) return;

    const newTime = (this.audioBuffer.duration * percentage) / 100;

    if (this.isRunning) {
      await this.pause();
    }

    this.pausedAt = newTime;
    this.play();
  }

  public drawChart() {
    this.drawer?.init();
  }
}

export default SoundDriver;
