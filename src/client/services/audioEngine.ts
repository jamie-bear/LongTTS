import type { AudioEncoding, StitchedAudio } from "../types/contracts";

interface AudioEngineEvents {
  onStatus: (message: string) => void;
  onBufferChange: (seconds: number) => void;
  onLevel: (level: number) => void;
  onAudioAvailable: () => void;
}

interface PlaybackItem { url: string; bytes: number }

export class AudioEngine {
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private appendQueue: ArrayBuffer[] = [];
  private playbackQueue: PlaybackItem[] = [];
  private audioChunks: ArrayBuffer[] = [];
  private segmentAudioChunks: ArrayBuffer[][] = [];
  private activeSegmentIndex = -1;
  private objectUrl = "";
  private currentPlaybackUrl = "";
  private queuedPcmBytes = 0;
  private currentPcmBytes = 0;
  private queuePlaying = false;
  private started = false;
  private encoding: AudioEncoding = "mpeg";
  private sampleRate = 24_000;
  private channels = 1;

  constructor(private readonly audio: HTMLAudioElement, private readonly events: AudioEngineEvents) {
    this.audio.addEventListener("ended", this.handleEnded);
    for (const event of ["timeupdate", "progress", "pause", "play"]) {
      this.audio.addEventListener(event, this.reportBuffer);
    }
  }

  reset(initialEncoding: AudioEncoding = "mpeg") {
    this.revokeUrls();
    this.audioChunks = [];
    this.segmentAudioChunks = [];
    this.activeSegmentIndex = -1;
    this.appendQueue = [];
    this.playbackQueue = [];
    this.queuedPcmBytes = 0;
    this.currentPcmBytes = 0;
    this.queuePlaying = false;
    this.encoding = initialEncoding;
    this.sampleRate = 24_000;
    this.channels = 1;
    this.sourceBuffer = null;
    this.started = true;

    if (initialEncoding === "pcm_s16le" || typeof MediaSource === "undefined") {
      this.mediaSource = null;
      this.audio.removeAttribute("src");
      this.audio.load();
      return;
    }

    this.mediaSource = new MediaSource();
    this.objectUrl = URL.createObjectURL(this.mediaSource);
    this.audio.src = this.objectUrl;
    this.mediaSource.addEventListener("sourceopen", () => {
      if (!this.mediaSource || this.sourceBuffer) return;
      this.sourceBuffer = this.mediaSource.addSourceBuffer("audio/mpeg");
      this.sourceBuffer.mode = "sequence";
      this.sourceBuffer.addEventListener("updateend", this.drainAppendQueue);
      this.drainAppendQueue();
    }, { once: true });
  }

  configure(encoding: AudioEncoding, sampleRate: number, channels: number) {
    const encodingChanged = this.encoding !== encoding;
    this.encoding = encoding;
    this.sampleRate = sampleRate || 24_000;
    this.channels = channels || 1;
    if (encodingChanged && encoding === "pcm_s16le") {
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = "";
      this.mediaSource = null;
      this.sourceBuffer = null;
      this.audio.removeAttribute("src");
      this.audio.load();
    }
  }

  beginSegment(index: number) {
    this.activeSegmentIndex = Math.max(0, index - 1);
    this.segmentAudioChunks[this.activeSegmentIndex] ??= [];
  }

  finishSegment(index: number) {
    if (this.activeSegmentIndex === Math.max(0, index - 1)) this.activeSegmentIndex = -1;
  }

  push(chunkValue: ArrayBuffer) {
    const chunk = chunkValue.slice(0);
    this.audioChunks.push(chunk);
    if (this.activeSegmentIndex < 0) this.beginSegment(this.segmentAudioChunks.length + 1);
    this.segmentAudioChunks[this.activeSegmentIndex].push(chunk);
    this.events.onLevel(1);
    this.events.onAudioAvailable();

    if (this.encoding === "pcm_s16le") {
      this.queuePcm(chunk);
      return;
    }
    this.appendQueue.push(chunk);
    this.drainAppendQueue();
    if (this.audio.paused && this.started) {
      void this.audio.play().catch(() => this.events.onStatus("Audio is buffering. Press play if your browser blocks autoplay."));
    }
  }

  complete(): StitchedAudio | null {
    this.endMediaStream();
    return this.snapshot();
  }

  snapshot(): StitchedAudio | null {
    const segments = this.segmentAudioChunks.filter((segment) => segment.length) || [];
    const generated = segments.length ? segments : this.audioChunks.length ? [this.audioChunks] : [];
    if (!generated.length) return null;
    const pcm = this.encoding === "pcm_s16le";
    return {
      blob: pcm ? createWavBlob(generated.flat(), { sampleRate: this.sampleRate, channels: this.channels }) : createMpegBlob(generated),
      extension: pcm ? "wav" : "mp3"
    };
  }

  download(audio: StitchedAudio, provider: string) {
    const url = URL.createObjectURL(audio.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${provider}-audiobook.${audio.extension}`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  bufferedAheadSeconds() {
    if (this.encoding === "pcm_s16le") {
      const currentRemaining = Number.isFinite(this.audio.duration)
        ? Math.max(0, this.audio.duration - (this.audio.currentTime || 0))
        : pcmBytesToSeconds(this.currentPcmBytes, this.sampleRate, this.channels);
      return currentRemaining + pcmBytesToSeconds(this.queuedPcmBytes, this.sampleRate, this.channels);
    }
    if (!this.audio.buffered.length) return 0;
    const current = this.audio.currentTime || 0;
    for (let index = 0; index < this.audio.buffered.length; index += 1) {
      const start = this.audio.buffered.start(index);
      const end = this.audio.buffered.end(index);
      if (current >= start && current <= end) return Math.max(0, end - current);
    }
    return Math.max(0, this.audio.buffered.end(this.audio.buffered.length - 1) - current);
  }

  stop() { this.started = false; }

  dispose() {
    this.stop();
    this.revokeUrls();
    this.audio.removeEventListener("ended", this.handleEnded);
    for (const event of ["timeupdate", "progress", "pause", "play"]) this.audio.removeEventListener(event, this.reportBuffer);
    this.sourceBuffer?.removeEventListener("updateend", this.drainAppendQueue);
  }

  private queuePcm(chunk: ArrayBuffer) {
    const blob = createWavBlob([chunk], { sampleRate: this.sampleRate, channels: this.channels });
    const url = URL.createObjectURL(blob);
    this.playbackQueue.push({ url, bytes: chunk.byteLength });
    this.queuedPcmBytes += chunk.byteLength;
    if (!this.queuePlaying && this.started) this.playNextPcm();
  }

  private playNextPcm = () => {
    if (this.encoding !== "pcm_s16le") return;
    if (this.currentPlaybackUrl) URL.revokeObjectURL(this.currentPlaybackUrl);
    this.currentPlaybackUrl = "";
    const next = this.playbackQueue.shift();
    if (!next) {
      this.queuePlaying = false;
      this.currentPcmBytes = 0;
      return;
    }
    this.queuePlaying = true;
    this.currentPlaybackUrl = next.url;
    this.currentPcmBytes = next.bytes;
    this.queuedPcmBytes = Math.max(0, this.queuedPcmBytes - next.bytes);
    this.audio.src = next.url;
    void this.audio.play().catch(() => this.events.onStatus("Audio is ready. Press play if your browser blocks autoplay."));
  };

  private handleEnded = () => this.playNextPcm();
  private reportBuffer = () => this.events.onBufferChange(this.bufferedAheadSeconds());

  private drainAppendQueue = () => {
    if (!this.sourceBuffer || this.sourceBuffer.updating || !this.appendQueue.length || this.mediaSource?.readyState !== "open") return;
    const next = this.appendQueue.shift();
    if (!next) return;
    try { this.sourceBuffer.appendBuffer(next); }
    catch (error) { this.events.onStatus(`Playback buffer error: ${error instanceof Error ? error.message : String(error)}`); }
  };

  private endMediaStream() {
    if (this.encoding === "pcm_s16le") return;
    const tryEnd = () => {
      if (!this.mediaSource || this.mediaSource.readyState !== "open") return;
      if (this.sourceBuffer?.updating || this.appendQueue.length) {
        window.setTimeout(tryEnd, 120);
        return;
      }
      try { this.mediaSource.endOfStream(); } catch { /* Stream may already be closed. */ }
    };
    tryEnd();
  }

  private revokeUrls() {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    if (this.currentPlaybackUrl) URL.revokeObjectURL(this.currentPlaybackUrl);
    this.playbackQueue.forEach(({ url }) => URL.revokeObjectURL(url));
    this.objectUrl = "";
    this.currentPlaybackUrl = "";
  }
}

export function createMpegBlob(segments: ArrayBuffer[][]) {
  const normalized = segments.map((chunks, index) => {
    const segment = chunks.length === 1 ? chunks[0] : concatArrayBuffers(chunks);
    let start = index === 0 ? 0 : getLeadingId3v2Size(segment);
    let end = segment.byteLength - (index < segments.length - 1 ? getTrailingId3v1Size(segment) : 0);
    if (start >= end) { start = 0; end = segment.byteLength; }
    return start === 0 && end === segment.byteLength ? segment : segment.slice(start, end);
  });
  return new Blob(normalized, { type: "audio/mpeg" });
}

export function concatArrayBuffers(chunks: ArrayBuffer[]) {
  const combined = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.byteLength, 0));
  let offset = 0;
  chunks.forEach((chunk) => { combined.set(new Uint8Array(chunk), offset); offset += chunk.byteLength; });
  return combined.buffer;
}

export function getLeadingId3v2Size(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 10 || bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return 0;
  const tagSize = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
  return Math.min(buffer.byteLength, 10 + tagSize + (bytes[5] & 0x10 ? 10 : 0));
}

export function getTrailingId3v1Size(buffer: ArrayBuffer) {
  if (buffer.byteLength < 128) return 0;
  const marker = new Uint8Array(buffer, buffer.byteLength - 128, 3);
  return marker[0] === 0x54 && marker[1] === 0x41 && marker[2] === 0x47 ? 128 : 0;
}

export function createWavBlob(chunks: ArrayBuffer[], options: { sampleRate: number; channels: number }) {
  const dataBytes = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const bytesPerSample = 2;
  writeAscii(view, 0, "RIFF"); view.setUint32(4, 36 + dataBytes, true); writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, options.channels, true); view.setUint32(24, options.sampleRate, true);
  view.setUint32(28, options.sampleRate * options.channels * bytesPerSample, true);
  view.setUint16(32, options.channels * bytesPerSample, true); view.setUint16(34, bytesPerSample * 8, true);
  writeAscii(view, 36, "data"); view.setUint32(40, dataBytes, true);
  return new Blob([header, ...chunks], { type: "audio/wav" });
}

function writeAscii(view: DataView, offset: number, value: string) {
  [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
}

function pcmBytesToSeconds(bytes: number, sampleRate: number, channels: number) {
  const bytesPerSecond = sampleRate * channels * 2;
  return bytesPerSecond > 0 ? bytes / bytesPerSecond : 0;
}
