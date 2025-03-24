class SoundDriver {
  private readonly audioFile: Blob;
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

  public getBuffer(): AudioBuffer | undefined {
    return this.audioBuffer;
  }

  public getCurrentTime(): number {
    return this.isRunning ? this.context.currentTime - this.startedAt : this.pausedAt;
  }

  public init(parent: HTMLElement | null): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!parent) {
        reject(new Error('Parent element not found'));
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(this.audioFile);
      reader.onload = (event: ProgressEvent<FileReader>) =>
        this.loadSound(event)
          .then(buffer => {
            this.audioBuffer = buffer;
            resolve();
          })
          .catch(reject);
      reader.onerror = reject;
    });
  }

  private loadSound(event: ProgressEvent<FileReader>): Promise<AudioBuffer> {
    if (!event?.target?.result) {
      throw new Error('Can not read file');
    }
    return this.context.decodeAudioData(event.target.result as ArrayBuffer);
  }

  public async play(): Promise<void> {
    if (!this.audioBuffer || this.isRunning) {
      return;
    }

    this.bufferSource = this.context.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;
    this.bufferSource.connect(this.gainNode);

    await this.context.resume();
    this.bufferSource.start(0, this.pausedAt);

    this.startedAt = this.context.currentTime - this.pausedAt;
    this.pausedAt = 0;
    this.isRunning = true;
  }

  public async pause(reset: boolean = false): Promise<void> {
    if (!this.bufferSource) {
      if (reset) {
        this.pausedAt = 0;
        this.isRunning = false;
      }
      return;
    }

    await this.context.suspend();
    this.pausedAt = reset ? 0 : this.context.currentTime - this.startedAt;
    this.bufferSource.stop();
    this.bufferSource.disconnect();
    this.bufferSource = null;
    this.isRunning = false;
  }

  public changeVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    console.log("Changing volume to:", clamped);
    this.gainNode.gain.setValueAtTime(clamped, this.context.currentTime);
  }

  public async setCurrentTime(time: number): Promise<void> {
    if (!this.audioBuffer) return;
    this.pausedAt = time;
    if (this.isRunning) {
      if (this.isRunning) {
        await this.pause();
      }
      this.pausedAt = time;
      this.play();
    }
  }

  // public drawChart(): void {
  //   this.drawer?.init();
  // }
}

export default SoundDriver;
