import { useEffect, useState } from "react";
import { MINIMAX_LANGUAGES, MINIMAX_MODELS, PROVIDER_ORDER, PROVIDERS, isVoxtralModel } from "../config/providers";
import type { useLongTtsController } from "../hooks/useLongTtsController";
import { Button, Checkbox, FieldPanel } from "./ui/Controls";
import { Icon } from "./ui/Icon";

type Controller = ReturnType<typeof useLongTtsController>;

export function ProviderSetup({ controller }: { controller: Controller }) {
  const { state, providerConfig, actions } = controller;
  const usesKey = providerConfig.authMode === "api-key";
  return <div className="provider-setup">
    <div className="field"><label className="field-label" htmlFor="provider">Provider</label>
      <select id="provider" value={state.provider} onChange={(event) => actions.selectProvider(event.target.value as keyof typeof PROVIDERS)}>
        {PROVIDER_ORDER.map((id) => <option key={id} value={id}>{PROVIDERS[id].label}</option>)}
      </select></div>
      {usesKey && <div className="credential-block">
        <label id="apiKeyLabel" className="field" htmlFor="apiKey"><span className="field-label">{providerConfig.credentialLabel}</span>
        <input id="apiKey" type="password" autoComplete="off" placeholder={providerConfig.credentialPlaceholder} value={state.credentials[state.provider]} onChange={(event) => actions.setCredential(event.target.value)} />
        </label>
        <Checkbox id="rememberKey" label="Keep for this browser session" checked={state.rememberCredential[state.provider]} onChange={(event) => actions.setRememberCredential(event.target.checked)} />
      </div>}

    {state.provider === "openrouter" && <OpenRouterSetup controller={controller} />}
    {state.provider === "minimax" && <MiniMaxSetup controller={controller} />}
    {state.provider === "google" && <GoogleSetup controller={controller} />}
  </div>;
}

function OpenRouterSetup({ controller }: { controller: Controller }) {
  const { state, actions } = controller;
  return <>
    <FieldPanel id="openrouterModelPanel" className="provider-model-panel" live>
      <label htmlFor="openrouterModel">OpenRouter model</label>
      <select id="openrouterModel" value={state.openrouterModel} disabled={!state.credentials.openrouter || !state.openrouterModels.length} onChange={(event) => actions.selectOpenRouterModel(event.target.value)}>
        {!state.credentials.openrouter && <option value="">Enter an OpenRouter API key to load models</option>}
        {state.credentials.openrouter && !state.openrouterModels.length && <option value="">Loading OpenRouter speech models...</option>}
        {state.openrouterModels.map((model) => <option key={model.id} value={model.id}>{model.name || model.id}</option>)}
      </select>
      <span>{state.credentials.openrouter ? "Choose the OpenRouter speech model and voice used for narration." : "Models and voices load after your API key is entered."}</span>
    </FieldPanel>
    {isVoxtralModel(state.openrouterModel) && <OpenRouterClonePanel controller={controller} />}
  </>;
}

function OpenRouterClonePanel({ controller }: { controller: Controller }) {
  const { state, actions } = controller;
  const selected = state.voice.startsWith("voice_id:") ? state.openrouterClones.find((voice) => voice.id === state.voice.slice(9)) : undefined;
  const [name, setName] = useState("");
  const [languages, setLanguages] = useState("");
  const [gender, setGender] = useState("");
  const [file, setFile] = useState<File>();
  useEffect(() => { setName(selected?.name || ""); setLanguages(selected?.languages?.join(", ") || ""); setGender(selected?.gender || ""); }, [selected]);
  return <details id="openrouterVoiceClonePanel" className="voice-tools-panel">
    <summary><span><Icon name="user" />Manage voice clones</span><span>{state.openrouterClones.length} saved</span></summary>
    <FieldPanel className="voice-clone-panel" live>
      <div className="voice-clone-header"><div><strong>Zero-shot voice clones</strong><span>{state.openrouterClones.length.toLocaleString()} locally saved voice clone{state.openrouterClones.length === 1 ? "" : "s"}.</span></div><Button type="button" onClick={() => actions.setCredential(state.credentials.openrouter)}><Icon name="refresh" />Refresh</Button></div>
    <div className="voice-clone-form">
      <label><span>Name</span><input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Narrator voice" /></label>
      <label><span>Language codes</span><input type="text" value={languages} onChange={(event) => setLanguages(event.target.value)} placeholder="en, fr" /></label>
      <label><span>Gender</span><select value={gender} onChange={(event) => setGender(event.target.value)}><option value="">Unspecified</option><option value="female">Female</option><option value="male">Male</option><option value="neutral">Neutral</option></select></label>
      <label><span>Reference audio</span><input type="file" accept="audio/*" onChange={(event) => setFile(event.target.files?.[0])} /></label>
      <Button type="button" className="primary" disabled={state.operationBusy} onClick={() => void actions.saveOpenRouterClone({ name, languages, gender, file })}><Icon name="check" />{selected ? "Update voice clone" : "Create voice clone"}</Button>
      <Button type="button" disabled={!selected || state.operationBusy} onClick={actions.deleteOpenRouterClone}><Icon name="trash" />Delete selected</Button>
    </div>
    <p className="voice-clone-policy">Only clone voices you have permission to use. Disclose AI-generated speech where required.</p>
    </FieldPanel>
  </details>;
}

function MiniMaxSetup({ controller }: { controller: Controller }) {
  const { state, actions } = controller;
  const selected = state.minimaxVoices.find((voice) => voice.id === state.voice);
  const [name, setName] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [languageModel, setLanguageModel] = useState("auto");
  const [promptText, setPromptText] = useState("");
  const [validationText, setValidationText] = useState("");
  const [source, setSource] = useState<File>();
  const [prompt, setPrompt] = useState<File>();
  useEffect(() => setName(selected?.name || ""), [selected]);
  return <>
    <FieldPanel id="minimaxModelPanel" className="provider-model-panel" live>
      <label htmlFor="minimaxModel">MiniMax speech model</label>
      <select id="minimaxModel" value={state.minimaxModel} onChange={(event) => actions.setMinimaxModel(event.target.value)}>{MINIMAX_MODELS.map((model) => <option key={model}>{model}</option>)}</select>
      <span>Choose the MiniMax model used for both voice cloning preview and narration.</span>
    </FieldPanel>
    <details id="minimaxVoiceClonePanel" className="voice-tools-panel">
      <summary><span><Icon name="user" />Manage voice clones</span><span>{state.minimaxVoices.length} available</span></summary>
      <FieldPanel className="voice-clone-panel" live>
      <div className="voice-clone-header"><div><strong>MiniMax voice clones</strong><span>Loaded {state.minimaxVoices.length.toLocaleString()} available MiniMax voice clone{state.minimaxVoices.length === 1 ? "" : "s"}.</span></div><Button type="button" onClick={() => actions.setCredential(state.credentials.minimax)}>Refresh voices</Button></div>
      <div className="voice-clone-form">
        <label><span>Voice name / ID</span><input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Narrator voice" /></label>
        <label><span>Clone preview text</span><input type="text" value={previewText} onChange={(event) => setPreviewText(event.target.value)} placeholder="A gentle breeze passes over the soft grass." /></label>
        <label><span>Language/accent recognition</span><select value={languageModel} onChange={(event) => setLanguageModel(event.target.value)}>{MINIMAX_LANGUAGES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Prompt text for accent/style (optional)</span><input type="text" value={promptText} onChange={(event) => setPromptText(event.target.value)} placeholder="Text spoken in the prompt audio" /></label>
        <label><span>Source transcript check (optional)</span><input type="text" maxLength={200} value={validationText} onChange={(event) => setValidationText(event.target.value)} placeholder="Transcript of the source audio" /></label>
        <label><span>Source audio</span><input type="file" accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp4,audio/wav,audio/x-wav" onChange={(event) => setSource(event.target.files?.[0])} /></label>
        <label><span>Prompt audio (optional, &lt;8s)</span><input type="file" accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp4,audio/wav,audio/x-wav" onChange={(event) => setPrompt(event.target.files?.[0])} /></label>
        <Button type="button" className="primary" disabled={state.operationBusy} onClick={() => void actions.saveMinimaxClone({ name, previewText, languageModel, promptText, validationText, source, prompt })}><Icon name="check" />Create voice clone</Button>
        <Button type="button" disabled={!selected || state.operationBusy} onClick={() => void actions.deleteMinimaxClone()}><Icon name="trash" />Delete selected</Button>
      </div>
      <p className="voice-clone-policy">Only clone voices you have permission to use. Prompt audio and text can improve accent, language, and speaking-style matching.</p>
      </FieldPanel>
    </details>
  </>;
}

function GoogleSetup({ controller }: { controller: Controller }) {
  const { state, actions } = controller;
  const auth = state.googleOAuth;
  return <FieldPanel id="googleAuthPanel" className="google-auth-panel" live>
    <div><strong>{auth.connected ? "Google connected" : auth.configured ? "Google OAuth ready" : "Google OAuth is not configured"}</strong><span>{auth.error || (auth.connected ? `Connected locally${auth.updatedAt ? ` · updated ${new Date(auth.updatedAt).toLocaleString()}` : ""}.` : auth.redirectUri || "Add Google OAuth credentials to the local environment.")}</span></div>
    <div className="google-auth-actions"><Button type="button" disabled={!auth.configured} onClick={actions.connectGoogle}>Connect Google</Button><Button type="button" disabled={!auth.connected} onClick={() => void actions.disconnectGoogle()}>Disconnect</Button></div>
  </FieldPanel>;
}
