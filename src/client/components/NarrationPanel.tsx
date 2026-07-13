import type { RefObject } from "react";
import { SEGMENT_OPTIONS } from "../config/providers";
import type { useLongTtsController } from "../hooks/useLongTtsController";
import { Button, Checkbox, SelectField } from "./ui/Controls";
import { Waveform } from "./Waveform";

type Controller = ReturnType<typeof useLongTtsController>;

export function NarrationPanel({ controller, audioRef }: { controller: Controller; audioRef: RefObject<HTMLAudioElement | null> }) {
  const { state, providerConfig, voiceOptions, limits, actions } = controller;
  const busy = state.phase === "connecting" || state.phase === "generating";
  const extension = state.stitchedAudio?.extension.toUpperCase() || (state.provider === "gemini" || state.provider === "google" || state.provider === "resemble" ? "WAV" : "MP3");
  return <aside className="control-panel" aria-label="Narration controls">
    <div className="cover-art" aria-hidden="true"><Waveform level={state.waveformLevel} /><div className="cover-title"><span>Live buffer</span><strong>{Math.round(state.bufferSeconds)}s</strong></div></div>
    <div className="player-block"><audio ref={audioRef} controls /><div className="button-grid"><Button id="startButton" type="button" className="primary" disabled={busy} onClick={() => void actions.startNarration()}>Start narration</Button><Button type="button" disabled={!busy} onClick={actions.stopNarration}>Stop</Button><Button type="button" disabled={!state.stitchedAudio} onClick={actions.download}>Download {extension}</Button></div></div>
    <div className="progress-block" aria-live="polite"><div className="progress-copy"><span>{state.status}</span><span>{state.currentSegment} / {state.totalSegments} segments</span></div><progress value={state.progress} max={100} aria-label="Narration generation progress" /></div>
    <form className="settings" aria-label="Narration settings" onSubmit={(event) => event.preventDefault()}>
      <div className="field-grid"><SelectField id="voice" label="Voice" options={voiceOptions} value={state.voice} onChange={(event) => actions.setVoice(event.target.value)} /><SelectField id="language" label="Language" options={providerConfig.languages} value={state.language} onChange={(event) => actions.setLanguage(event.target.value)} /></div>
      <label className="range-line" htmlFor="speed"><span>Speed <strong>{state.speed.toFixed(2)}x</strong></span><input id="speed" type="range" min="0.7" max="1.5" step="0.05" value={state.speed} onChange={(event) => actions.setSpeed(Number(event.target.value))} /></label>
      <div className="field-grid single-field"><SelectField id="segmentChars" label="Segment size" options={SEGMENT_OPTIONS.map((option) => ({ ...option, disabled: Number(option.value) > limits.maxSegmentChars }))} value={state.segmentChars} onChange={(event) => actions.setSegmentChars(Number(event.target.value))} /></div>
      {providerConfig.supportsLowLatency && <Checkbox id="lowLatency" label="Optimize first audio chunk" checked={state.lowLatency} onChange={(event) => actions.setLowLatency(event.target.checked)} />}
      {providerConfig.supportsTextNormalization && <Checkbox id="textNormalization" label="Normalize numbers and abbreviations" checked={state.textNormalization} onChange={(event) => actions.setTextNormalization(event.target.checked)} />}
    </form>
  </aside>;
}
