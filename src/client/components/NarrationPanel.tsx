import type { ReactNode, RefObject } from "react";
import { isOpenRouterPcmModel, SEGMENT_OPTIONS } from "../config/providers";
import type { useBigTtsController } from "../hooks/useBigTtsController";
import { ProviderSetup } from "./ProviderSetup";
import { Button, Checkbox, SelectField } from "./ui/Controls";
import { Icon } from "./ui/Icon";

type Controller = ReturnType<typeof useBigTtsController>;

export function NarrationPanel({ controller, audioRef }: { controller: Controller; audioRef: RefObject<HTMLAudioElement | null> }) {
  const { state, providerConfig, voiceOptions, hasVoiceGenderMetadata, limits, actions } = controller;
  const busy = state.phase === "connecting" || state.phase === "generating";
  const pcm = state.provider === "gemini" || state.provider === "google" || state.provider === "resemble" || (state.provider === "openrouter" && isOpenRouterPcmModel(state.openrouterModel));
  const extension = state.stitchedAudio?.extension.toUpperCase() || (pcm ? "WAV" : "MP3");
  const partial = state.audioAvailable && state.phase !== "completed";
  const lowLatencyAvailable = Boolean(providerConfig.supportsLowLatency);
  const textNormalizationAvailable = Boolean(providerConfig.supportsTextNormalization);
  const unavailableCapabilityCount = Number(!lowLatencyAvailable) + Number(!textNormalizationAvailable);
  return <aside className="control-panel" aria-label="Narration controls">
    <section className="card setup-card" aria-labelledby="provider-heading">
      <div className="compact-heading"><div className="heading-icon"><Icon name="key" /></div><div><p className="eyebrow">Connection</p><h2 id="provider-heading">Provider & access</h2></div></div>
      <ProviderSetup controller={controller} />
    </section>

    <section className="card setup-card" aria-labelledby="settings-heading">
      <div className="compact-heading"><div className="heading-icon"><Icon name="settings" /></div><div><p className="eyebrow">Configuration</p><h2 id="settings-heading">Voice & synthesis</h2></div></div>
      <form className="settings" aria-label="Narration settings" onSubmit={(event) => event.preventDefault()}>
        <SelectField id="voice" label="Voice" options={voiceOptions} value={state.voice} onChange={(event) => actions.setVoice(event.target.value)} helper={hasVoiceGenderMetadata ? "Gender is shown as text only where provider metadata is available." : undefined} />
        <div className="field-grid"><SelectField id="language" label="Language" options={providerConfig.languages} value={state.language} onChange={(event) => actions.setLanguage(event.target.value)} /><SelectField id="segmentChars" label="Segment size" options={SEGMENT_OPTIONS.map((option) => ({ ...option, disabled: Number(option.value) > limits.maxSegmentChars }))} value={state.segmentChars} onChange={(event) => actions.setSegmentChars(Number(event.target.value))} helper={`${state.segmentChars.toLocaleString()} characters per request`} /></div>
        <div className={`setting-block ${providerConfig.supportsSpeed ? "" : "is-unavailable"}`}>
          <div className="setting-title"><label htmlFor="speed">Reading speed</label>{providerConfig.supportsSpeed ? <output htmlFor="speed">{state.speed.toFixed(2)}×</output> : <span className="availability-badge">Unavailable</span>}</div>
          <input id="speed" type="range" min="0.7" max="1.5" step="0.05" value={state.speed} disabled={!providerConfig.supportsSpeed} onChange={(event) => actions.setSpeed(Number(event.target.value))} />
          {!providerConfig.supportsSpeed && <small>This provider does not accept a reading-speed setting.</small>}
        </div>
        <div className="capability-list" aria-label="Provider capabilities">
          {lowLatencyAvailable && <Capability available unavailableText=""><Checkbox id="lowLatency" label="Optimize first audio chunk" checked={state.lowLatency} onChange={(event) => actions.setLowLatency(event.target.checked)} /></Capability>}
          {textNormalizationAvailable && <Capability available unavailableText=""><Checkbox id="textNormalization" label="Normalize numbers and abbreviations" checked={state.textNormalization} onChange={(event) => actions.setTextNormalization(event.target.checked)} /></Capability>}
          {unavailableCapabilityCount > 0 && <details className="unavailable-capabilities">
            <summary><span>Unavailable options</span><span>{unavailableCapabilityCount}</span></summary>
            <div className="unavailable-capability-list">
              {!lowLatencyAvailable && <Capability available={false} unavailableText="Only xAI exposes first-chunk latency control."><Checkbox id="lowLatency" label="Optimize first audio chunk" checked={state.lowLatency} disabled onChange={(event) => actions.setLowLatency(event.target.checked)} /></Capability>}
              {!textNormalizationAvailable && <Capability available={false} unavailableText="Only xAI exposes text normalization control."><Checkbox id="textNormalization" label="Normalize numbers and abbreviations" checked={state.textNormalization} disabled onChange={(event) => actions.setTextNormalization(event.target.checked)} /></Capability>}
            </div>
          </details>}
        </div>
      </form>
    </section>

    <section className="card output-card" aria-labelledby="output-heading">
      <div className="compact-heading output-heading"><div className="heading-icon"><Icon name="audio" /></div><div><p className="eyebrow">Output</p><h2 id="output-heading">Narration</h2></div><span className={`phase-badge phase-${state.phase}`}>{state.phase}</span></div>
      <div className="progress-block" aria-live="polite" aria-atomic="true"><div className="progress-copy"><span>{state.status}</span><span>{state.currentSegment} / {state.totalSegments} segments</span></div><progress value={state.progress} max={100} aria-label="Narration generation progress" /></div>
      <div className="buffer-row"><span>Playback buffer</span><strong>{Math.round(state.bufferSeconds)}s</strong></div>
      <audio ref={audioRef} controls aria-label="Generated narration playback" />
      <div className="button-grid"><Button id="startButton" type="button" className="primary" disabled={busy} onClick={() => void actions.startNarration()}><Icon name="play" />Start narration</Button><Button type="button" disabled={!busy} onClick={actions.stopNarration}><Icon name="stop" />Stop</Button></div>
      <Button type="button" className="download-button" disabled={!state.audioAvailable} onClick={actions.download}><Icon name="download" />Download {partial ? "partial " : ""}{extension}<span>{state.audioAvailable ? "Includes all audio received so far" : "Available as soon as audio is received"}</span></Button>
    </section>
  </aside>;
}

function Capability({ available, unavailableText, children }: { available: boolean; unavailableText: string; children: ReactNode }) {
  return <div className={`capability ${available ? "" : "is-unavailable"}`}>{children}{!available && <div className="capability-note"><span className="availability-badge">Unavailable</span><small>{unavailableText}</small></div>}</div>;
}
