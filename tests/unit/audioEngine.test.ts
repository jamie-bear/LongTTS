import { createMpegBlob, createWavBlob, getLeadingId3v2Size, getTrailingId3v1Size } from "../../src/client/services/audioEngine";

describe("audio assembly", () => {
  it("creates a valid PCM WAV header", async () => {
    const blob = createWavBlob([new Uint8Array([1, 2, 3, 4]).buffer], { sampleRate: 24_000, channels: 1 });
    const bytes = new Uint8Array(await readBlob(blob));
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(bytes.slice(8, 12))).toBe("WAVE");
    expect(blob.type).toBe("audio/wav");
  });

  it("removes repeated MP3 ID3 metadata between segments", async () => {
    const tagged = new Uint8Array(14);
    tagged.set([0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4]);
    expect(getLeadingId3v2Size(tagged.buffer)).toBe(10);
    expect(getTrailingId3v1Size(tagged.buffer)).toBe(0);
    const blob = createMpegBlob([[new Uint8Array([5, 6]).buffer], [tagged.buffer]]);
    expect(blob.type).toBe("audio/mpeg");
    expect(blob.size).toBe(6);
  });
});

function readBlob(blob: Blob) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result as ArrayBuffer));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsArrayBuffer(blob);
  });
}
