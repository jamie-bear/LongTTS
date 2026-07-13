const elements = {
  provider: document.querySelector("#provider"),
  apiKey: document.querySelector("#apiKey"),
  apiKeyLabel: document.querySelector("#apiKeyLabel"),
  rememberKey: document.querySelector("#rememberKey"),
  credentialSessionLine: document.querySelector("#credentialSessionLine"),
  googleAuthPanel: document.querySelector("#googleAuthPanel"),
  googleAuthState: document.querySelector("#googleAuthState"),
  googleAuthHint: document.querySelector("#googleAuthHint"),
  googleConnectButton: document.querySelector("#googleConnectButton"),
  googleDisconnectButton: document.querySelector("#googleDisconnectButton"),
  openrouterModelPanel: document.querySelector("#openrouterModelPanel"),
  openrouterModel: document.querySelector("#openrouterModel"),
  openrouterModelHint: document.querySelector("#openrouterModelHint"),
  openrouterVoiceClonePanel: document.querySelector("#openrouterVoiceClonePanel"),
  minimaxModelPanel: document.querySelector("#minimaxModelPanel"),
  minimaxModel: document.querySelector("#minimaxModel"),
  minimaxModelHint: document.querySelector("#minimaxModelHint"),
  minimaxVoiceClonePanel: document.querySelector("#minimaxVoiceClonePanel"),
  minimaxVoiceCloneHint: document.querySelector("#minimaxVoiceCloneHint"),
  refreshMinimaxVoicesButton: document.querySelector("#refreshMinimaxVoicesButton"),
  minimaxVoiceCloneName: document.querySelector("#minimaxVoiceCloneName"),
  minimaxVoiceCloneText: document.querySelector("#minimaxVoiceCloneText"),
  minimaxVoiceClonePromptText: document.querySelector("#minimaxVoiceClonePromptText"),
  minimaxVoiceCloneLanguageModel: document.querySelector("#minimaxVoiceCloneLanguageModel"),
  minimaxVoiceCloneValidationText: document.querySelector("#minimaxVoiceCloneValidationText"),
  minimaxVoiceCloneAudio: document.querySelector("#minimaxVoiceCloneAudio"),
  minimaxVoiceClonePromptAudio: document.querySelector("#minimaxVoiceClonePromptAudio"),
  saveMinimaxVoiceCloneButton: document.querySelector("#saveMinimaxVoiceCloneButton"),
  deleteMinimaxVoiceCloneButton: document.querySelector("#deleteMinimaxVoiceCloneButton"),
  openrouterVoiceCloneHint: document.querySelector("#openrouterVoiceCloneHint"),
  refreshOpenrouterVoicesButton: document.querySelector("#refreshOpenrouterVoicesButton"),
  voiceCloneName: document.querySelector("#voiceCloneName"),
  voiceCloneLanguages: document.querySelector("#voiceCloneLanguages"),
  voiceCloneGender: document.querySelector("#voiceCloneGender"),
  voiceCloneAudio: document.querySelector("#voiceCloneAudio"),
  saveVoiceCloneButton: document.querySelector("#saveVoiceCloneButton"),
  deleteVoiceCloneButton: document.querySelector("#deleteVoiceCloneButton"),
  bookText: document.querySelector("#bookText"),
  fileInput: document.querySelector("#fileInput"),
  sampleButton: document.querySelector("#sampleButton"),
  clearTextButton: document.querySelector("#clearTextButton"),
  charCount: document.querySelector("#charCount"),
  costEstimate: document.querySelector("#costEstimate"),
  voice: document.querySelector("#voice"),
  language: document.querySelector("#language"),
  speed: document.querySelector("#speed"),
  speedValue: document.querySelector("#speedValue"),
  segmentChars: document.querySelector("#segmentChars"),
  lowLatency: document.querySelector("#lowLatency"),
  lowLatencyLine: document.querySelector("#lowLatencyLine"),
  lowLatencyLabel: document.querySelector("#lowLatencyLabel"),
  textNormalization: document.querySelector("#textNormalization"),
  textNormalizationLine: document.querySelector("#textNormalizationLine"),
  audio: document.querySelector("#audio"),
  startButton: document.querySelector("#startButton"),
  stopButton: document.querySelector("#stopButton"),
  downloadButton: document.querySelector("#downloadButton"),
  statusText: document.querySelector("#statusText"),
  segmentText: document.querySelector("#segmentText"),
  progressBar: document.querySelector("#progressBar"),
  bufferReadout: document.querySelector("#bufferReadout"),
  waveCanvas: document.querySelector("#waveCanvas")
};

const GEMINI_VOICES = [
  { value: "Kore", label: "Kore - Firm" },
  { value: "Puck", label: "Puck - Upbeat" },
  { value: "Aoede", label: "Aoede - Breezy" },
  { value: "Charon", label: "Charon - Informative" },
  { value: "Zephyr", label: "Zephyr - Bright" },
  { value: "Fenrir", label: "Fenrir - Excitable" },
  { value: "Leda", label: "Leda - Youthful" },
  { value: "Orus", label: "Orus - Firm" },
  { value: "Callirrhoe", label: "Callirrhoe - Easy-going" },
  { value: "Autonoe", label: "Autonoe - Bright" },
  { value: "Enceladus", label: "Enceladus - Breathy (Male)" },
  { value: "Iapetus", label: "Iapetus - Clear" },
  { value: "Umbriel", label: "Umbriel - Easy-going" },
  { value: "Algieba", label: "Algieba - Smooth" },
  { value: "Despina", label: "Despina - Smooth" },
  { value: "Erinome", label: "Erinome - Clear" },
  { value: "Algenib", label: "Algenib - Gravelly" },
  { value: "Rasalgethi", label: "Rasalgethi - Informative" },
  { value: "Laomedeia", label: "Laomedeia - Upbeat" },
  { value: "Achernar", label: "Achernar - Soft" },
  { value: "Alnilam", label: "Alnilam - Firm" },
  { value: "Schedar", label: "Schedar - Even" },
  { value: "Gacrux", label: "Gacrux - Mature" },
  { value: "Pulcherrima", label: "Pulcherrima - Forward" },
  { value: "Achird", label: "Achird - Friendly" },
  { value: "Zubenelgenubi", label: "Zubenelgenubi - Casual" },
  { value: "Vindemiatrix", label: "Vindemiatrix - Gentle" },
  { value: "Sadachbia", label: "Sadachbia - Lively" },
  { value: "Sadaltager", label: "Sadaltager - Knowledgeable" },
  { value: "Sulafat", label: "Sulafat - Warm" }
];

const PROVIDERS = {
  gemini: {
    label: "Gemini API",
    storageKey: "geminiApiKey",
    credentialLabel: "Gemini API key",
    credentialPlaceholder: "AI Studio API key",
    defaultVoice: "Enceladus",
    defaultLanguage: "auto",
    defaultSegmentChars: 500,
    maxSegmentChars: 12000,
    lowLatencyLabel: "",
    voices: GEMINI_VOICES,
    languages: [
      { value: "auto", label: "Auto" }
    ]
  },
  xai: {
    label: "xAI: Grok TTS 1.0",
    storageKey: "xaiApiKey",
    credentialLabel: "xAI API key",
    credentialPlaceholder: "xai-...",
    defaultVoice: "eve",
    defaultLanguage: "auto",
    defaultSegmentChars: 4500,
    maxSegmentChars: 12000,
    costPerMillionChars: 15,
    lowLatencyLabel: "Optimize first audio chunk",
    voices: [
      { value: "eve", label: "Eve" },
      { value: "ara", label: "Ara" },
      { value: "leo", label: "Leo" },
      { value: "rex", label: "Rex" },
      { value: "sal", label: "Sal" }
    ],
    languages: [
      { value: "auto", label: "Auto" },
      { value: "en", label: "English" },
      { value: "de", label: "German" },
      { value: "fr", label: "French" },
      { value: "it", label: "Italian" },
      { value: "es-ES", label: "Spanish (Spain)" },
      { value: "es-MX", label: "Spanish (Mexico)" },
      { value: "pt-BR", label: "Portuguese (Brazil)" },
      { value: "pt-PT", label: "Portuguese (Portugal)" },
      { value: "zh", label: "Chinese" },
      { value: "ja", label: "Japanese" },
      { value: "ko", label: "Korean" },
      { value: "hi", label: "Hindi" },
      { value: "id", label: "Indonesian" },
      { value: "tr", label: "Turkish" },
      { value: "vi", label: "Vietnamese" },
      { value: "ru", label: "Russian" },
      { value: "bn", label: "Bengali" },
      { value: "ar-EG", label: "Arabic (Egypt)" },
      { value: "ar-SA", label: "Arabic (Saudi Arabia)" },
      { value: "ar-AE", label: "Arabic (UAE)" }
    ]
  },
  openrouter: {
    label: "OpenRouter: Various Models",
    storageKey: "openrouterApiKey",
    credentialLabel: "OpenRouter API key",
    credentialPlaceholder: "sk-or-...",
    defaultVoice: "alloy",
    defaultLanguage: "auto",
    defaultSegmentChars: 4500,
    maxSegmentChars: 12000,
    lowLatencyLabel: "",
    voices: [{ value: "", label: "Select a model to load voices" }],
    languages: [{ value: "auto", label: "Auto" }]
  },

  minimax: {
    label: "MiniMax: Custom Voices",
    storageKey: "minimaxApiKey",
    credentialLabel: "MiniMax API key",
    credentialPlaceholder: "MiniMax API key",
    defaultVoice: "",
    defaultLanguage: "auto",
    defaultSegmentChars: 4500,
    maxSegmentChars: 10000,
    lowLatencyLabel: "",
    costPerMillionChars: 30,
    voices: [{ value: "", label: "Create or refresh MiniMax custom voices" }],
    languages: [
      { value: "auto", label: "Auto" },
      { value: "English", label: "English" },
      { value: "Chinese", label: "Chinese" },
      { value: "Chinese,Yue", label: "Chinese (Cantonese)" },
      { value: "Spanish", label: "Spanish" },
      { value: "French", label: "French" },
      { value: "Portuguese", label: "Portuguese" },
      { value: "German", label: "German" },
      { value: "Arabic", label: "Arabic" },
      { value: "Russian", label: "Russian" },
      { value: "Japanese", label: "Japanese" },
      { value: "Italian", label: "Italian" },
      { value: "Korean", label: "Korean" },
      { value: "Hindi", label: "Hindi" }
    ]
  },
  resemble: {
    label: "Resemble.ai: Custom Voices",
    storageKey: "resembleApiKey",
    credentialLabel: "Resemble.ai API key",
    credentialPlaceholder: "Bearer token",
    defaultVoice: "",
    defaultLanguage: "auto",
    defaultSegmentChars: 4500,
    maxSegmentChars: 12000,
    lowLatencyLabel: "",
    voices: [{ value: "", label: "Enter a Resemble.ai API key to load custom voices" }],
    languages: [{ value: "auto", label: "Auto" }]
  },
  google: {
    label: "Google: Gemini 3.1 Flash TTS (Preview)",
    storageKey: "googleTtsCredential",
    credentialLabel: "",
    credentialPlaceholder: "",
    defaultVoice: "Enceladus",
    defaultLanguage: "en-US",
    defaultSegmentChars: 500,
    maxSegmentChars: 4500,
    lowLatencyLabel: "",
    voices: GEMINI_VOICES,
    languages: [
      { value: "en-US", label: "English (US)" },
      { value: "en-GB", label: "English (UK)" },
      { value: "de-DE", label: "German (Germany)" },
      { value: "fr-FR", label: "French (France)" },
      { value: "it-IT", label: "Italian (Italy)" },
      { value: "es-ES", label: "Spanish (Spain)" },
      { value: "pt-BR", label: "Portuguese (Brazil)" },
      { value: "ja-JP", label: "Japanese" },
      { value: "ko-KR", label: "Korean" }
    ]
  }
};

const OPENROUTER_VOICE_CLONES_STORAGE_KEY = "openrouterVoiceClones";
const MINIMAX_VOICE_CLONES_STORAGE_KEY = "minimaxVoiceClones";
const MAX_VOICE_CLONE_AUDIO_BYTES = 4 * 1024 * 1024;

const SAMPLE_TEXT = `Chapter One

The morning train crossed the valley just as the clouds began to lift from the river. Mara watched the light spill across the windows and tried to remember the sentence she had written before sleep took her. It had been a good sentence, she was sure of that, the sort that opened a door in the mind and made the next page feel inevitable.

She found the notebook in her coat pocket. Between two pages was a ticket, folded once, with a station name she did not recognize. When the conductor passed, he paused beside her seat and smiled as if they had spoken many times before.

"You will want the north platform when we arrive," he said.

Mara looked down at the ticket again. The ink was fresh. Under the station name, in a careful hand, someone had written: Bring the whole story.`;

const state = {
  provider: "openrouter",
  credentialsByProvider: {
    gemini: "",
    xai: "",
    google: "",
    openrouter: "",
    resemble: "",
    minimax: ""
  },
  segmentCharsByProvider: {
    gemini: PROVIDERS.gemini.defaultSegmentChars,
    xai: PROVIDERS.xai.defaultSegmentChars,
    google: PROVIDERS.google.defaultSegmentChars,
    openrouter: 4500,
    resemble: PROVIDERS.resemble.defaultSegmentChars,
    minimax: PROVIDERS.minimax.defaultSegmentChars
  },
  openrouterModels: [],
  openrouterVoicesByModel: {},
  openrouterModel: "",
  openrouterVoiceClones: [],
  openrouterModelLoadTimer: null,
  resembleVoices: [],
  minimaxVoices: [],
  minimaxModel: sessionStorage.getItem("minimaxModel") || "speech-2.8-hd",
  resembleVoiceLoadTimer: null,
  googleOAuth: {
    configured: false,
    connected: false,
    redirectUri: "",
    updatedAt: null
  },
  ws: null,
  mediaSource: null,
  sourceBuffer: null,
  appendQueue: [],
  playbackQueue: [],
  objectUrl: "",
  currentPlaybackUrl: "",
  audioChunks: [],
  segmentAudioChunks: [],
  activeSegmentIndex: -1,
  stitchedAudio: null,
  queuedPcmBytes: 0,
  currentPcmBytes: 0,
  queuePlaying: false,
  audioBytes: 0,
  audioEncoding: "mpeg",
  sampleRate: 24000,
  channels: 1,
  totalChars: 0,
  totalSegments: 0,
  currentSegment: 0,
  drawingLevel: 0,
  telemetryTimer: null,
  started: false
};

init();

function init() {
  state.credentialsByProvider.gemini = sessionStorage.getItem(PROVIDERS.gemini.storageKey) || "";
  state.credentialsByProvider.xai = sessionStorage.getItem(PROVIDERS.xai.storageKey) || "";
  state.credentialsByProvider.openrouter = sessionStorage.getItem(PROVIDERS.openrouter.storageKey) || "";
  state.credentialsByProvider.resemble = sessionStorage.getItem(PROVIDERS.resemble.storageKey) || "";
  state.credentialsByProvider.minimax = sessionStorage.getItem(PROVIDERS.minimax.storageKey) || "";
  state.openrouterModel = sessionStorage.getItem("openrouterModel") || "";
  sessionStorage.removeItem(PROVIDERS.google.storageKey);
  state.provider = sanitizeProvider(sessionStorage.getItem("ttsProvider"));
  elements.provider.value = state.provider;
  elements.apiKey.value = state.provider === "google" ? "" : state.credentialsByProvider[state.provider] || "";
  elements.rememberKey.checked = state.provider !== "google" && Boolean(sessionStorage.getItem(PROVIDERS[state.provider].storageKey));

  applyProviderConfig();
  updateTextStats();
  updateSpeedLabel();
  drawWaveform();

  elements.provider.addEventListener("change", handleProviderChange);
  elements.segmentChars.addEventListener("change", handleSegmentSizeChange);
  elements.bookText.addEventListener("input", updateTextStats);
  elements.speed.addEventListener("input", updateSpeedLabel);
  elements.voice.addEventListener("change", handleVoiceChange);
  elements.startButton.addEventListener("click", startNarration);
  elements.stopButton.addEventListener("click", stopNarration);
  elements.downloadButton.addEventListener("click", downloadAudio);
  elements.sampleButton.addEventListener("click", loadSample);
  elements.clearTextButton.addEventListener("click", clearText);
  elements.fileInput.addEventListener("change", loadTextFile);
  elements.rememberKey.addEventListener("change", persistKeyPreference);
  elements.apiKey.addEventListener("input", handleApiKeyInput);
  elements.openrouterModel.addEventListener("change", handleOpenRouterModelChange);
  elements.refreshOpenrouterVoicesButton.addEventListener("click", () => loadOpenRouterVoiceClones());
  elements.saveVoiceCloneButton.addEventListener("click", saveOpenRouterVoiceClone);
  elements.deleteVoiceCloneButton.addEventListener("click", deleteSelectedOpenRouterVoiceClone);
  elements.minimaxModel.addEventListener("change", handleMinimaxModelChange);
  elements.refreshMinimaxVoicesButton.addEventListener("click", () => loadMinimaxVoices());
  elements.saveMinimaxVoiceCloneButton.addEventListener("click", saveMinimaxVoiceClone);
  elements.deleteMinimaxVoiceCloneButton.addEventListener("click", deleteSelectedMinimaxVoiceClone);
  elements.googleConnectButton.addEventListener("click", connectGoogleOAuth);
  elements.googleDisconnectButton.addEventListener("click", disconnectGoogleOAuth);
  window.addEventListener("message", handleWindowMessage);

  elements.audio.addEventListener("pause", sendTelemetry);
  elements.audio.addEventListener("play", sendTelemetry);
  elements.audio.addEventListener("ended", handleAudioEnded);
  elements.audio.addEventListener("timeupdate", sendTelemetry);
  elements.audio.addEventListener("progress", sendTelemetry);

  refreshGoogleOAuthStatus();
  if (state.provider === "openrouter" && state.credentialsByProvider.openrouter) {
    scheduleOpenRouterModelsLoad(0);
  }
  if (state.provider === "resemble" && state.credentialsByProvider.resemble) {
    scheduleResembleVoicesLoad(0);
  }
  if (state.provider === "minimax") {
    loadMinimaxVoices();
  }
}

function handleProviderChange() {
  if (state.provider !== "google") {
    state.credentialsByProvider[state.provider] = elements.apiKey.value.trim();
  }
  state.segmentCharsByProvider[state.provider] = Number(elements.segmentChars.value);
  state.provider = sanitizeProvider(elements.provider.value);
  sessionStorage.setItem("ttsProvider", state.provider);
  elements.apiKey.value = state.provider === "google" ? "" : state.credentialsByProvider[state.provider] || "";
  elements.rememberKey.checked = state.provider !== "google" && Boolean(sessionStorage.getItem(PROVIDERS[state.provider].storageKey));
  applyProviderConfig();
  updateTextStats();
  if (state.provider === "openrouter" && state.credentialsByProvider.openrouter) {
    scheduleOpenRouterModelsLoad(0);
  }
  if (state.provider === "resemble" && state.credentialsByProvider.resemble) {
    scheduleResembleVoicesLoad(0);
  }
  if (state.provider === "minimax") {
    loadMinimaxVoices();
  }
}

function handleApiKeyInput() {
  persistKeyPreference();
  if (state.provider === "openrouter") {
    scheduleOpenRouterModelsLoad(450);
  }
  if (state.provider === "resemble") {
    scheduleResembleVoicesLoad(450);
  }
}

function handleSegmentSizeChange() {
  state.segmentCharsByProvider[state.provider] = Number(elements.segmentChars.value);
}

function applyProviderConfig() {
  const config = PROVIDERS[state.provider];
  const previousVoice = elements.voice.value;
  const previousLanguage = elements.language.value;
  const usesBrowserCredential = state.provider !== "google";

  elements.apiKeyLabel.textContent = config.credentialLabel;
  elements.apiKey.placeholder = config.credentialPlaceholder;
  elements.apiKeyLabel.classList.toggle("is-hidden", !usesBrowserCredential);
  elements.apiKey.classList.toggle("is-hidden", !usesBrowserCredential);
  elements.credentialSessionLine.classList.toggle("is-hidden", !usesBrowserCredential);
  elements.apiKey.disabled = !usesBrowserCredential;
  elements.rememberKey.disabled = !usesBrowserCredential;
  if (!usesBrowserCredential) {
    elements.apiKey.value = "";
    elements.rememberKey.checked = false;
  }
  elements.lowLatencyLabel.textContent = config.lowLatencyLabel;
  elements.lowLatencyLine.classList.toggle("is-hidden", state.provider === "gemini" || state.provider === "google" || state.provider === "openrouter" || state.provider === "resemble" || state.provider === "minimax");
  elements.lowLatency.disabled = state.provider === "gemini" || state.provider === "google" || state.provider === "openrouter" || state.provider === "resemble" || state.provider === "minimax";
  elements.textNormalizationLine.classList.toggle("is-hidden", state.provider !== "xai");
  elements.textNormalization.disabled = state.provider !== "xai";
  elements.googleAuthPanel.classList.toggle("is-hidden", state.provider !== "google");
  elements.openrouterModelPanel.classList.toggle("is-hidden", state.provider !== "openrouter");
  elements.minimaxModelPanel.classList.toggle("is-hidden", state.provider !== "minimax");
  elements.minimaxVoiceClonePanel.classList.toggle("is-hidden", state.provider !== "minimax");
  elements.minimaxModel.value = state.minimaxModel;
  elements.openrouterVoiceClonePanel.classList.toggle("is-hidden", state.provider !== "openrouter" || !isVoxtralModel(state.openrouterModel));
  updateDownloadButton();

  const voiceOptions = state.provider === "openrouter"
    ? getOpenRouterVoiceOptions(state.openrouterModel)
    : state.provider === "resemble"
      ? getResembleVoiceOptions()
      : state.provider === "minimax"
        ? getMinimaxVoiceOptions()
        : config.voices;
  populateSelect(elements.voice, voiceOptions, previousVoice, config.defaultVoice);
  populateSelect(elements.language, config.languages, previousLanguage, config.defaultLanguage);

  if (state.provider === "google") {
    syncGoogleLanguageToVoice();
  }

  syncSegmentSizeControl(config);

  updateOpenRouterModelPanel();
  updateGoogleOAuthPanel();
}

function syncSegmentSizeControl(config) {
  const segmentConfig = getActiveSegmentConfig(config);
  for (const option of elements.segmentChars.options) {
    option.disabled = Number(option.value) > segmentConfig.maxSegmentChars;
  }

  const preferredValue = String(state.segmentCharsByProvider[state.provider] || segmentConfig.defaultSegmentChars);
  const preferredOption = Array.from(elements.segmentChars.options)
    .find((option) => option.value === preferredValue && !option.disabled);

  elements.segmentChars.value = preferredOption ? preferredValue : String(segmentConfig.defaultSegmentChars);
  state.segmentCharsByProvider[state.provider] = Number(elements.segmentChars.value);
}

function getActiveSegmentConfig(config) {
  if (state.provider === "openrouter" && isOpenRouterGeminiTtsModel(state.openrouterModel)) {
    return { ...config, defaultSegmentChars: 500, maxSegmentChars: 4500 };
  }

  return config;
}

function sanitizeProvider(value) {
  if (value === "xai" || value === "google" || value === "openrouter" || value === "resemble" || value === "minimax") return value;
  return "openrouter";
}

function usesPcmPlayback(provider) {
  return provider === "gemini" || provider === "google" || provider === "resemble";
}

function populateSelect(select, options, preferredValue, fallbackValue) {
  select.replaceChildren(...options.map((optionConfig) => {
    const option = document.createElement("option");
    option.value = optionConfig.value;
    option.textContent = optionConfig.label;
    if (optionConfig.language) option.dataset.language = optionConfig.language;
    if (optionConfig.disabled) option.disabled = true;
    return option;
  }));

  const hasPreferred = options.some((option) => option.value === preferredValue);
  const hasFallback = options.some((option) => option.value === fallbackValue);
  select.value = hasPreferred ? preferredValue : hasFallback ? fallbackValue : options[0].value;
}



function getMinimaxVoiceOptions() {
  return state.minimaxVoices.length
    ? state.minimaxVoices.map((voice) => ({ value: voice.id, label: voice.model ? `${voice.name} (${voice.model})` : voice.name }))
    : PROVIDERS.minimax.voices;
}

function handleMinimaxModelChange() {
  state.minimaxModel = elements.minimaxModel.value || "speech-2.8-hd";
  sessionStorage.setItem("minimaxModel", state.minimaxModel);
}

async function loadMinimaxVoices(updateSelect = true) {
  if (state.provider !== "minimax") return;
  const localVoices = readStoredMinimaxVoiceClones();
  const apiKey = elements.apiKey.value.trim();
  let remoteVoices = [];
  if (apiKey) {
    try {
      const response = await fetch("/api/minimax/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey })
      });
      const body = await readJsonResponse(response);
      if (!response.ok) throw new Error(body.error || `${response.status} ${response.statusText}`);
      remoteVoices = Array.isArray(body.voices) ? body.voices : [];
    } catch (error) {
      setStatus(`MiniMax voice refresh failed: ${error.message}`);
    }
  }
  state.minimaxVoices = mergeMinimaxVoiceClones(localVoices, remoteVoices);
  writeStoredMinimaxVoiceClones(state.minimaxVoices);
  if (updateSelect) populateSelect(elements.voice, getMinimaxVoiceOptions(), elements.voice.value, state.minimaxVoices[0]?.id || "");
  syncMinimaxVoiceCloneFormToSelection();
  const sourceLabel = apiKey ? "available" : "locally saved";
  elements.minimaxVoiceCloneHint.textContent = `Loaded ${state.minimaxVoices.length.toLocaleString()} ${sourceLabel} MiniMax voice clone${state.minimaxVoices.length === 1 ? "" : "s"}.`;
}

async function saveMinimaxVoiceClone() {
  const apiKey = elements.apiKey.value.trim();
  const [sourceFile] = elements.minimaxVoiceCloneAudio.files;
  const [promptFile] = elements.minimaxVoiceClonePromptAudio.files;
  const name = elements.minimaxVoiceCloneName.value.trim();
  if (!apiKey) return setStatus("Add your MiniMax API key before creating voice clones.");
  if (!name) return setStatus("Name the MiniMax voice clone first.");
  if (!sourceFile) return setStatus("Choose source audio to create a MiniMax voice clone.");
  if (sourceFile.size > 20 * 1024 * 1024 || (promptFile && promptFile.size > 20 * 1024 * 1024)) return setStatus("MiniMax voice clone audio files must be 20 MB or smaller.");
  const promptText = elements.minimaxVoiceClonePromptText.value.trim();
  if ((promptFile && !promptText) || (!promptFile && promptText)) return setStatus("MiniMax prompt audio and prompt text must be provided together.");
  elements.saveMinimaxVoiceCloneButton.disabled = true;
  try {
    const payload = {
      apiKey,
      name,
      model: state.minimaxModel,
      previewText: elements.minimaxVoiceCloneText.value.trim(),
      promptText,
      languageModel: elements.minimaxVoiceCloneLanguageModel.value,
      textValidation: elements.minimaxVoiceCloneValidationText.value.trim(),
      sourceAudio: await fileToBase64(sourceFile),
      sourceFilename: sourceFile.name,
      sourceContentType: sourceFile.type || "application/octet-stream",
      promptAudio: promptFile ? await fileToBase64(promptFile) : "",
      promptFilename: promptFile?.name || "",
      promptContentType: promptFile?.type || "application/octet-stream"
    };
    const response = await fetch("/api/minimax/voices/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const body = await readJsonResponse(response);
    if (!response.ok) throw new Error(body.error || `${response.status} ${response.statusText}`);
    const voice = body.voice;
    state.minimaxVoices = [voice, ...state.minimaxVoices.filter((item) => item.id !== voice.id)];
    writeStoredMinimaxVoiceClones(state.minimaxVoices);
    elements.minimaxVoiceCloneAudio.value = "";
    elements.minimaxVoiceClonePromptAudio.value = "";
    await loadMinimaxVoices();
    elements.voice.value = voice.id;
    syncMinimaxVoiceCloneFormToSelection();
    setStatus(`MiniMax voice clone created: ${voice.name}.`);
  } catch (error) {
    setStatus(`MiniMax voice clone failed: ${error.message}`);
  } finally {
    elements.saveMinimaxVoiceCloneButton.disabled = false;
  }
}

async function deleteSelectedMinimaxVoiceClone() {
  const voiceId = elements.voice.value;
  if (!voiceId) return setStatus("Select a MiniMax voice clone to delete.");
  const apiKey = elements.apiKey.value.trim();
  if (!apiKey) return setStatus("Add your MiniMax API key before deleting a MiniMax voice clone.");
  elements.deleteMinimaxVoiceCloneButton.disabled = true;
  try {
    const response = await fetch("/api/minimax/voices/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, voiceId })
    });
    const body = await readJsonResponse(response);
    if (!response.ok) throw new Error(body.error || `${response.status} ${response.statusText}`);
    state.minimaxVoices = state.minimaxVoices.filter((voice) => voice.id !== voiceId);
    writeStoredMinimaxVoiceClones(state.minimaxVoices);
    await loadMinimaxVoices();
    setStatus("MiniMax voice clone deleted.");
  } catch (error) {
    setStatus(`MiniMax voice clone delete failed: ${error.message}`);
  } finally {
    elements.deleteMinimaxVoiceCloneButton.disabled = false;
  }
}

function syncMinimaxVoiceCloneFormToSelection() {
  const voice = state.minimaxVoices.find((item) => item.id === elements.voice.value);
  elements.minimaxVoiceCloneName.value = voice?.name || "";
  elements.deleteMinimaxVoiceCloneButton.disabled = !voice;
  elements.saveMinimaxVoiceCloneButton.textContent = "Create voice clone";
}

function mergeMinimaxVoiceClones(localVoices, remoteVoices) {
  const merged = new Map();
  for (const voice of localVoices) {
    if (voice?.id) merged.set(voice.id, voice);
  }
  for (const voice of remoteVoices) {
    if (!voice?.id) continue;
    const local = merged.get(voice.id) || {};
    merged.set(voice.id, { ...voice, ...local, name: local.name || voice.name || voice.id });
  }
  return [...merged.values()];
}

function readStoredMinimaxVoiceClones() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MINIMAX_VOICE_CLONES_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((voice) => voice?.id) : [];
  } catch {
    return [];
  }
}

function writeStoredMinimaxVoiceClones(voices) {
  localStorage.setItem(MINIMAX_VOICE_CLONES_STORAGE_KEY, JSON.stringify(voices));
}

function getResembleVoiceOptions() {
  return state.resembleVoices.length
    ? state.resembleVoices.map((voice) => ({ value: voice.id, label: voice.language ? `${voice.name} (${voice.language})` : voice.name }))
    : PROVIDERS.resemble.voices;
}

function scheduleResembleVoicesLoad(delay) {
  window.clearTimeout(state.resembleVoiceLoadTimer);
  state.resembleVoiceLoadTimer = window.setTimeout(loadResembleVoices, delay);
}

async function loadResembleVoices() {
  const apiKey = elements.apiKey.value.trim();
  if (!apiKey || state.provider !== "resemble") {
    state.resembleVoices = [];
    populateSelect(elements.voice, getResembleVoiceOptions(), "", PROVIDERS.resemble.defaultVoice);
    return;
  }

  populateSelect(elements.voice, [{ value: "", label: "Loading Resemble.ai custom voices..." }], elements.voice.value, "");
  try {
    const response = await fetch("/api/resemble/voices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey })
    });
    const body = await readJsonResponse(response);
    if (!response.ok) throw new Error(body.error || `${response.status} ${response.statusText}`);
    state.resembleVoices = body.voices || [];
    populateSelect(elements.voice, getResembleVoiceOptions(), elements.voice.value, state.resembleVoices[0]?.id || "");
    setStatus(state.resembleVoices.length
      ? `Loaded ${state.resembleVoices.length.toLocaleString()} Resemble.ai custom voice${state.resembleVoices.length === 1 ? "" : "s"}.`
      : "No ready Resemble.ai custom voices were returned for this key.");
  } catch (error) {
    state.resembleVoices = [];
    populateSelect(elements.voice, [{ value: "", label: "Could not load Resemble.ai voices" }], "", "");
    setStatus(`Resemble.ai voice load failed: ${error.message}`);
  }
}

function handleOpenRouterModelChange() {
  state.openrouterModel = elements.openrouterModel.value;
  sessionStorage.setItem("openrouterModel", state.openrouterModel);
  populateSelect(elements.voice, getOpenRouterVoiceOptions(state.openrouterModel), "", PROVIDERS.openrouter.defaultVoice);
  syncSegmentSizeControl(PROVIDERS.openrouter);
  elements.openrouterVoiceClonePanel.classList.toggle("is-hidden", state.provider !== "openrouter" || !isVoxtralModel(state.openrouterModel));
  if (isVoxtralModel(state.openrouterModel)) loadOpenRouterVoiceClones();
}

function isOpenRouterGeminiTtsModel(modelId) {
  return /(^|[/:-])(?:google|gemini)(?:[/:-]|$)/i.test(String(modelId || ""));
}

function isVoxtralModel(modelId) {
  return /voxtral/i.test(String(modelId || ""));
}

function formatVoiceCloneOption(voice) {
  const name = voice.name || voice.id;
  const languageSuffix = Array.isArray(voice.languages) && voice.languages.length ? ` (${voice.languages.join(", ")})` : "";
  return { value: `voice_id:${voice.id}`, label: `Clone: ${name}${languageSuffix}` };
}

function mergeOpenRouterVoiceOptions(baseOptions) {
  const cloneOptions = state.openrouterVoiceClones.map(formatVoiceCloneOption);
  return cloneOptions.length
    ? [{ value: "", label: "Built-in voices", disabled: true }, ...baseOptions, { value: "", label: "Saved voice clones", disabled: true }, ...cloneOptions]
    : baseOptions;
}

function getOpenRouterVoiceOptions(modelId) {
  const baseOptions = state.openrouterVoicesByModel[modelId] || PROVIDERS.openrouter.voices;
  return isVoxtralModel(modelId) ? mergeOpenRouterVoiceOptions(baseOptions) : baseOptions;
}

function getOpenRouterBuiltInVoiceFallback(modelId) {
  const baseOptions = state.openrouterVoicesByModel[modelId] || [];
  return baseOptions.find((option) => option.value && !option.disabled)?.value || PROVIDERS.openrouter.defaultVoice;
}

function updateOpenRouterModelPanel() {
  if (state.provider !== "openrouter") return;
  const hasKey = Boolean(elements.apiKey.value.trim());
  elements.openrouterModel.disabled = !hasKey || state.openrouterModels.length === 0;
  if (!hasKey) {
    elements.openrouterModel.replaceChildren(new Option("Enter an OpenRouter API key to load models", ""));
    elements.openrouterModelHint.textContent = "Models and voices load after your API key is entered.";
  }
}

function scheduleOpenRouterModelsLoad(delay) {
  window.clearTimeout(state.openrouterModelLoadTimer);
  state.openrouterModelLoadTimer = window.setTimeout(loadOpenRouterModels, delay);
}

async function loadOpenRouterModels() {
  const apiKey = elements.apiKey.value.trim();
  if (!apiKey || state.provider !== "openrouter") {
    updateOpenRouterModelPanel();
    return;
  }
  elements.openrouterModel.disabled = true;
  elements.openrouterModelHint.textContent = "Loading OpenRouter speech models...";
  try {
    const response = await fetch("/api/openrouter/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey })
    });
    const body = await readJsonResponse(response);
    if (!response.ok) throw new Error(body.error || `${response.status} ${response.statusText}`);
    state.openrouterModels = body.models || [];
    state.openrouterVoicesByModel = Object.fromEntries(state.openrouterModels.map((model) => [model.id, model.voices]));
    const options = state.openrouterModels.map((model) => new Option(model.name || model.id, model.id));
    elements.openrouterModel.replaceChildren(...(options.length ? options : [new Option("No speech models found", "")]));
    const preferred = state.openrouterModels.some((model) => model.id === state.openrouterModel) ? state.openrouterModel : state.openrouterModels[0]?.id || "";
    elements.openrouterModel.value = preferred;
    state.openrouterModel = preferred;
    syncSegmentSizeControl(PROVIDERS.openrouter);
    if (preferred) sessionStorage.setItem("openrouterModel", preferred);
    if (isVoxtralModel(preferred)) await loadOpenRouterVoiceClones(false);
    populateSelect(elements.voice, getOpenRouterVoiceOptions(preferred), "", PROVIDERS.openrouter.defaultVoice);
    elements.openrouterModel.disabled = !state.openrouterModels.length;
    elements.openrouterVoiceClonePanel.classList.toggle("is-hidden", state.provider !== "openrouter" || !isVoxtralModel(preferred));
    elements.openrouterModelHint.textContent = state.openrouterModels.length
      ? `Loaded ${state.openrouterModels.length.toLocaleString()} speech model${state.openrouterModels.length === 1 ? "" : "s"}.`
      : "No OpenRouter speech models were returned for this key.";
  } catch (error) {
    elements.openrouterModel.replaceChildren(new Option("Could not load OpenRouter models", ""));
    elements.openrouterModelHint.textContent = `OpenRouter model load failed: ${error.message}`;
  }
}

async function loadOpenRouterVoiceClones(updateSelect = true) {
  if (state.provider !== "openrouter" || !isVoxtralModel(state.openrouterModel)) return;
  state.openrouterVoiceClones = readStoredOpenRouterVoiceClones();
  if (updateSelect) populateSelect(elements.voice, getOpenRouterVoiceOptions(state.openrouterModel), elements.voice.value, PROVIDERS.openrouter.defaultVoice);
  syncVoiceCloneFormToSelection();
  elements.openrouterVoiceCloneHint.textContent = `Loaded ${state.openrouterVoiceClones.length.toLocaleString()} locally saved voice clone${state.openrouterVoiceClones.length === 1 ? "" : "s"}.`;
}

async function saveOpenRouterVoiceClone() {
  const apiKey = elements.apiKey.value.trim();
  const [file] = elements.voiceCloneAudio.files;
  const selectedCloneId = getSelectedVoiceCloneId();
  const name = elements.voiceCloneName.value.trim();
  if (!apiKey) return setStatus("Add your OpenRouter API key before managing Voxtral voice clones.");
  if (!name) return setStatus("Name the voice clone first.");
  if (!selectedCloneId && !file) return setStatus("Choose reference audio to create a voice clone.");
  if (file && file.size > MAX_VOICE_CLONE_AUDIO_BYTES) return setStatus("Reference audio must be 4 MB or smaller for local saved clones.");
  elements.saveVoiceCloneButton.disabled = true;
  try {
    const existing = state.openrouterVoiceClones.find((voice) => voice.id === selectedCloneId);
    const clone = {
      id: selectedCloneId || createLocalVoiceCloneId(),
      name,
      languages: elements.voiceCloneLanguages.value.split(",").map((v) => v.trim()).filter(Boolean),
      gender: elements.voiceCloneGender.value,
      sampleAudio: existing?.sampleAudio || "",
      sampleFilename: existing?.sampleFilename || "sample.wav",
      baseVoice: existing?.baseVoice || getOpenRouterBuiltInVoiceFallback(state.openrouterModel),
      updatedAt: new Date().toISOString()
    };
    if (file) {
      clone.sampleFilename = file.name;
      clone.sampleAudio = await fileToBase64(file);
    }
    if (!clone.sampleAudio) throw new Error("Reference audio is required to create a voice clone.");
    state.openrouterVoiceClones = [clone, ...state.openrouterVoiceClones.filter((voice) => voice.id !== clone.id)];
    writeStoredOpenRouterVoiceClones(state.openrouterVoiceClones);
    elements.voiceCloneAudio.value = "";
    await loadOpenRouterVoiceClones();
    elements.voice.value = `voice_id:${clone.id}`;
    syncVoiceCloneFormToSelection();
    setStatus(selectedCloneId ? "Voice clone updated locally." : "Voice clone saved locally.");
  } catch (error) {
    setStatus(`Voice clone save failed: ${error.message}`);
  } finally {
    elements.saveVoiceCloneButton.disabled = false;
  }
}

async function deleteSelectedOpenRouterVoiceClone() {
  const apiKey = elements.apiKey.value.trim();
  const voiceId = getSelectedVoiceCloneId();
  if (!voiceId) return setStatus("Select a saved voice clone to delete.");
  elements.deleteVoiceCloneButton.disabled = true;
  try {
    state.openrouterVoiceClones = state.openrouterVoiceClones.filter((voice) => voice.id !== voiceId);
    writeStoredOpenRouterVoiceClones(state.openrouterVoiceClones);
    elements.voice.value = PROVIDERS.openrouter.defaultVoice;
    await loadOpenRouterVoiceClones();
    setStatus("Voice clone deleted locally.");
  } catch (error) {
    setStatus(`Voice clone delete failed: ${error.message}`);
  } finally {
    elements.deleteVoiceCloneButton.disabled = false;
  }
}

function getSelectedVoiceCloneId() {
  return elements.voice.value.startsWith("voice_id:") ? elements.voice.value.slice("voice_id:".length) : "";
}

function getSelectedVoiceClone() {
  const voiceId = getSelectedVoiceCloneId();
  return state.openrouterVoiceClones.find((voice) => voice.id === voiceId) || null;
}

function createLocalVoiceCloneId() {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStoredOpenRouterVoiceClones() {
  try {
    const parsed = JSON.parse(localStorage.getItem(OPENROUTER_VOICE_CLONES_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((voice) => voice?.id && voice?.sampleAudio) : [];
  } catch {
    return [];
  }
}

function writeStoredOpenRouterVoiceClones(voices) {
  localStorage.setItem(OPENROUTER_VOICE_CLONES_STORAGE_KEY, JSON.stringify(voices));
}

async function readJsonResponse(response) {
  const text = await response.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const compact = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    throw new Error(`Expected JSON from ${response.url || "the server"}, but received ${response.headers.get("content-type") || "a non-JSON response"}${compact ? `: ${compact.slice(0, 180)}` : "."}`);
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result).split(",")[1] || ""));
    reader.addEventListener("error", () => reject(reader.error || new Error("Could not read audio file.")));
    reader.readAsDataURL(file);
  });
}

function handleVoiceChange() {
  if (state.provider === "google") {
    syncGoogleLanguageToVoice();
  }

  if (state.provider === "openrouter") {
    syncVoiceCloneFormToSelection();
  }
  if (state.provider === "minimax") {
    syncMinimaxVoiceCloneFormToSelection();
  }
}

function syncVoiceCloneFormToSelection() {
  const voiceId = getSelectedVoiceCloneId();
  const selectedClone = state.openrouterVoiceClones.find((voice) => voice.id === voiceId);
  elements.deleteVoiceCloneButton.disabled = !selectedClone;
  elements.saveVoiceCloneButton.textContent = selectedClone ? "Update voice clone" : "Create voice clone";
  if (!selectedClone) return;
  elements.voiceCloneName.value = selectedClone.name || "";
  elements.voiceCloneLanguages.value = Array.isArray(selectedClone.languages) ? selectedClone.languages.join(", ") : "";
  elements.voiceCloneGender.value = selectedClone.gender || "";
}

function syncGoogleLanguageToVoice() {
  const selected = elements.voice.selectedOptions[0];
  if (selected?.dataset.language) {
    elements.language.value = selected.dataset.language;
  }
}

async function refreshGoogleOAuthStatus() {
  try {
    const response = await fetch("/api/google-oauth/status", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    state.googleOAuth = await response.json();
  } catch {
    state.googleOAuth = {
      configured: false,
      connected: false,
      redirectUri: "",
      updatedAt: null
    };
  }

  updateGoogleOAuthPanel();
}

function updateGoogleOAuthPanel() {
  const auth = state.googleOAuth;
  elements.googleConnectButton.disabled = !auth.configured;
  elements.googleDisconnectButton.disabled = !auth.connected;

  if (!auth.configured) {
    elements.googleAuthState.textContent = "Google OAuth needs .env setup";
    elements.googleAuthHint.textContent = auth.redirectUri
      ? `Authorized redirect URI: ${auth.redirectUri}`
      : "Add Google OAuth client settings, then restart the app.";
    return;
  }

  if (auth.connected) {
    elements.googleAuthState.textContent = "Google OAuth connected";
    elements.googleAuthHint.textContent = auth.updatedAt
      ? `Token saved locally ${formatRelativeDate(auth.updatedAt)}.`
      : "Token saved locally.";
    return;
  }

  elements.googleAuthState.textContent = "Google OAuth ready";
  elements.googleAuthHint.textContent = `Authorized redirect URI: ${auth.redirectUri}`;
}

function connectGoogleOAuth() {
  const popup = window.open("/auth/google/start", "googleOAuth", "width=560,height=720");
  setStatus("Waiting for Google sign-in...");

  if (!popup) {
    window.location.assign("/auth/google/start");
    return;
  }

  const poll = window.setInterval(async () => {
    if (!popup.closed) return;
    window.clearInterval(poll);
    await refreshGoogleOAuthStatus();
    setStatus(state.googleOAuth.connected ? "Google OAuth connected." : "Google sign-in was not completed.");
  }, 1000);
}

async function disconnectGoogleOAuth() {
  elements.googleDisconnectButton.disabled = true;
  try {
    const response = await fetch("/api/google-oauth/disconnect", { method: "POST" });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    await refreshGoogleOAuthStatus();
    setStatus("Google OAuth disconnected.");
  } catch (error) {
    setStatus(`Google disconnect failed: ${error.message}`);
    await refreshGoogleOAuthStatus();
  }
}

function handleWindowMessage(event) {
  if (event.origin !== window.location.origin) return;
  if (event.data?.type !== "google-oauth-complete") return;

  refreshGoogleOAuthStatus().then(() => {
    setStatus(state.googleOAuth.connected ? "Google OAuth connected." : "Google sign-in finished, but no token was saved.");
  });
}

function formatRelativeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";

  const seconds = Math.max(1, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

async function startNarration() {
  const apiKey = state.provider === "google" ? "" : elements.apiKey.value.trim();
  const text = elements.bookText.value.trim();

  if (state.provider === "google") {
    await refreshGoogleOAuthStatus();
  }

  const canUseStoredGoogleOAuth = state.provider === "google" && state.googleOAuth.connected;
  if (!apiKey && !canUseStoredGoogleOAuth) {
    setStatus(state.provider === "google"
      ? "Connect Google before starting narration."
      : `Add your ${PROVIDERS[state.provider].credentialLabel}.`);
    if (state.provider === "google") {
      elements.googleConnectButton.focus();
    } else {
      elements.apiKey.focus();
    }
    return;
  }

  if (!text) {
    setStatus("Paste text or load a .txt file.");
    elements.bookText.focus();
    return;
  }

  persistKeyPreference();
  resetAudioPipeline();

  const wsUrl = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/stream`;
  const ws = new WebSocket(wsUrl);
  ws.binaryType = "arraybuffer";
  state.ws = ws;
  state.started = true;

  setBusy(true);
  setStatus("Opening local narration stream...");

  ws.addEventListener("open", () => {
    ws.send(JSON.stringify({
      type: "start",
      apiKey,
      text,
      options: readOptions()
    }));
    startTelemetry();
  });

  ws.addEventListener("message", (event) => {
    if (typeof event.data === "string") {
      handleServerEvent(JSON.parse(event.data));
      return;
    }

    handleAudioChunk(event.data);
  });

  ws.addEventListener("close", () => {
    stopTelemetry();
    setBusy(false);
  });

  ws.addEventListener("error", () => {
    setStatus("Local stream error.");
    setBusy(false);
  });
}

function stopNarration() {
  if (state.ws?.readyState === WebSocket.OPEN) {
    state.ws.send(JSON.stringify({ type: "cancel" }));
  }

  state.ws?.close();
  state.ws = null;
  stopTelemetry();
  setBusy(false);
  setStatus("Stopped.");
}

function handleServerEvent(event) {
  if (event.type === "meta") {
    state.audioEncoding = event.audioEncoding || "mpeg";
    state.sampleRate = event.sampleRate || 24000;
    state.channels = event.channels || 1;
    state.totalChars = event.totalChars;
    state.totalSegments = event.totalSegments;
    state.currentSegment = 0;
    elements.progressBar.value = 0;
    elements.segmentText.textContent = `0 / ${state.totalSegments} segments`;
    updateDownloadButton();
    setStatus(`Prepared ${state.totalSegments} streaming segments.`);
    return;
  }

  if (event.type === "status") {
    setStatus(event.message);
    return;
  }

  if (event.type === "segment") {
    state.currentSegment = event.index;
    beginSegmentAudio(event.index);
    elements.segmentText.textContent = `${event.index} / ${event.totalSegments} segments`;
    elements.progressBar.value = ((event.index - 1) / event.totalSegments) * 100;
    setStatus(`Generating segment ${event.index}...`);
    return;
  }

  if (event.type === "segmentDone") {
    elements.segmentText.textContent = `${event.index} / ${event.totalSegments} segments`;
    elements.progressBar.value = (event.index / event.totalSegments) * 100;
    finishSegmentAudio(event.index);
    setStatus(`Buffered segment ${event.index}.`);
    sendTelemetry();
    return;
  }

  if (event.type === "bytes") {
    state.audioBytes = event.totalBytes;
    return;
  }

  if (event.type === "waiting") {
    setStatus(event.message);
    return;
  }

  if (event.type === "complete") {
    elements.progressBar.value = 100;
    endMediaStream();
    prepareStitchedDownload();
    setBusy(false);
    return;
  }

  if (event.type === "cancelled") {
    setStatus(event.message || "Cancelled.");
    endMediaStream();
    setBusy(false);
    return;
  }

  if (event.type === "error") {
    setStatus(event.message || "Narration failed.");
    endMediaStream();
    setBusy(false);
  }
}

function handleAudioChunk(arrayBuffer) {
  const chunk = arrayBuffer.slice(0);
  state.audioChunks.push(chunk);
  addChunkToActiveSegment(chunk);
  state.audioBytes += chunk.byteLength;
  state.drawingLevel = Math.min(1, state.drawingLevel + 0.25);

  if (state.audioEncoding === "pcm_s16le") {
    queuePcmForPlayback(chunk);
    return;
  }

  appendAudio(chunk);

  if (elements.audio.paused && state.started) {
    elements.audio.play().catch(() => {
      setStatus("Audio is buffering. Press play if your browser blocks autoplay.");
    });
  }
}

function resetAudioPipeline() {
  revokeAudioUrls();
  state.audioChunks = [];
  state.segmentAudioChunks = [];
  state.activeSegmentIndex = -1;
  state.stitchedAudio = null;
  state.audioBytes = 0;
  state.appendQueue = [];
  state.playbackQueue = [];
  state.queuedPcmBytes = 0;
  state.currentPcmBytes = 0;
  state.queuePlaying = false;
  state.audioEncoding = usesPcmPlayback(state.provider) ? "pcm_s16le" : "mpeg";
  state.sampleRate = 24000;
  state.channels = 1;
  state.sourceBuffer = null;
  state.currentSegment = 0;
  state.totalSegments = 0;
  updateDownloadButton();
  elements.progressBar.value = 0;
  elements.segmentText.textContent = "0 / 0 segments";

  if (state.audioEncoding === "pcm_s16le") {
    state.mediaSource = null;
    elements.audio.removeAttribute("src");
    elements.audio.load();
    return;
  }

  state.mediaSource = new MediaSource();
  state.objectUrl = URL.createObjectURL(state.mediaSource);
  elements.audio.src = state.objectUrl;

  state.mediaSource.addEventListener("sourceopen", () => {
    if (state.sourceBuffer) return;

    state.sourceBuffer = state.mediaSource.addSourceBuffer("audio/mpeg");
    state.sourceBuffer.mode = "sequence";
    state.sourceBuffer.addEventListener("updateend", drainAppendQueue);
    drainAppendQueue();
  }, { once: true });
}

function revokeAudioUrls() {
  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = "";
  }

  if (state.currentPlaybackUrl) {
    URL.revokeObjectURL(state.currentPlaybackUrl);
    state.currentPlaybackUrl = "";
  }

  for (const item of state.playbackQueue) {
    URL.revokeObjectURL(item.url);
  }
}

function queuePcmForPlayback(chunk) {
  const blob = createWavBlob([chunk], {
    sampleRate: state.sampleRate,
    channels: state.channels
  });
  const url = URL.createObjectURL(blob);
  state.playbackQueue.push({ url, bytes: chunk.byteLength });
  state.queuedPcmBytes += chunk.byteLength;

  if (!state.queuePlaying && state.started) {
    playNextQueuedAudio();
  }
}

function handleAudioEnded() {
  if (state.audioEncoding === "pcm_s16le") {
    playNextQueuedAudio();
  }
}

function playNextQueuedAudio() {
  if (state.audioEncoding !== "pcm_s16le") return;

  if (state.currentPlaybackUrl) {
    URL.revokeObjectURL(state.currentPlaybackUrl);
    state.currentPlaybackUrl = "";
  }

  const next = state.playbackQueue.shift();
  if (!next) {
    state.queuePlaying = false;
    state.currentPcmBytes = 0;
    return;
  }

  state.queuePlaying = true;
  state.currentPlaybackUrl = next.url;
  state.currentPcmBytes = next.bytes;
  state.queuedPcmBytes = Math.max(0, state.queuedPcmBytes - next.bytes);
  elements.audio.src = next.url;
  elements.audio.play().catch(() => {
    setStatus("Audio is ready. Press play if your browser blocks autoplay.");
  });
}

function appendAudio(chunk) {
  state.appendQueue.push(chunk);
  drainAppendQueue();
}

function drainAppendQueue() {
  const sourceBuffer = state.sourceBuffer;
  if (!sourceBuffer || sourceBuffer.updating || state.appendQueue.length === 0) return;
  if (state.mediaSource?.readyState !== "open") return;

  try {
    sourceBuffer.appendBuffer(state.appendQueue.shift());
  } catch (error) {
    setStatus(`Playback buffer error: ${error.message}`);
  }
}

function endMediaStream() {
  if (state.audioEncoding === "pcm_s16le") return;

  const tryEnd = () => {
    if (!state.mediaSource || state.mediaSource.readyState !== "open") return;
    if (state.sourceBuffer?.updating || state.appendQueue.length > 0) {
      window.setTimeout(tryEnd, 120);
      return;
    }

    try {
      state.mediaSource.endOfStream();
    } catch {
      // Browsers can throw if the stream already ended.
    }
  };

  tryEnd();
}

function readOptions() {
  return {
    provider: state.provider,
    voice: state.provider === "openrouter" ? getSelectedVoiceClone()?.baseVoice || elements.voice.value : elements.voice.value,
    language: elements.language.value,
    speed: Number(elements.speed.value),
    segmentChars: Number(elements.segmentChars.value),
    optimizeStreamingLatency: elements.lowLatency.checked,
    textNormalization: elements.textNormalization.checked,
    model: state.provider === "openrouter" ? elements.openrouterModel.value : state.provider === "minimax" ? elements.minimaxModel.value : "",
    voiceId: state.provider === "openrouter" ? getSelectedVoiceCloneId() : "",
    voiceReferenceAudio: state.provider === "openrouter" ? getSelectedVoiceClone()?.sampleAudio || "" : "",
    voiceReferenceFilename: state.provider === "openrouter" ? getSelectedVoiceClone()?.sampleFilename || "" : ""
  };
}

function sendTelemetry() {
  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return;

  state.ws.send(JSON.stringify({
    type: "telemetry",
    paused: elements.audio.paused,
    bufferedAheadSeconds: getBufferedAheadSeconds()
  }));

  updateBufferReadout();
}

function startTelemetry() {
  stopTelemetry();
  state.telemetryTimer = window.setInterval(sendTelemetry, 1000);
}

function stopTelemetry() {
  if (state.telemetryTimer) {
    window.clearInterval(state.telemetryTimer);
    state.telemetryTimer = null;
  }
}

function getBufferedAheadSeconds() {
  if (state.audioEncoding === "pcm_s16le") {
    const currentRemaining = Number.isFinite(elements.audio.duration)
      ? Math.max(0, elements.audio.duration - (elements.audio.currentTime || 0))
      : pcmBytesToSeconds(state.currentPcmBytes, state.sampleRate, state.channels);
    return currentRemaining + pcmBytesToSeconds(state.queuedPcmBytes, state.sampleRate, state.channels);
  }

  const audio = elements.audio;
  if (!audio.buffered.length) return 0;

  const current = audio.currentTime || 0;
  for (let index = 0; index < audio.buffered.length; index += 1) {
    const start = audio.buffered.start(index);
    const end = audio.buffered.end(index);
    if (current >= start && current <= end) {
      return Math.max(0, end - current);
    }
  }

  return Math.max(0, audio.buffered.end(audio.buffered.length - 1) - current);
}

function updateBufferReadout() {
  elements.bufferReadout.textContent = `${Math.round(getBufferedAheadSeconds())}s`;
}

function beginSegmentAudio(index) {
  const segmentIndex = Math.max(0, Number(index) - 1);
  state.activeSegmentIndex = segmentIndex;
  if (!state.segmentAudioChunks[segmentIndex]) {
    state.segmentAudioChunks[segmentIndex] = [];
  }
}

function addChunkToActiveSegment(chunk) {
  if (state.activeSegmentIndex < 0) {
    beginSegmentAudio(state.segmentAudioChunks.length + 1);
  }

  state.segmentAudioChunks[state.activeSegmentIndex].push(chunk);
}

function finishSegmentAudio(index) {
  const segmentIndex = Math.max(0, Number(index) - 1);
  if (state.activeSegmentIndex === segmentIndex) {
    state.activeSegmentIndex = -1;
  }
}

function prepareStitchedDownload() {
  const segments = getGeneratedAudioSegments();
  if (!segments.length) {
    state.stitchedAudio = null;
    updateDownloadButton();
    setStatus("Narration fully generated, but no audio was received.");
    return;
  }

  elements.downloadButton.disabled = true;
  setStatus(`Stitching ${segments.length.toLocaleString()} segment${segments.length === 1 ? "" : "s"}...`);

  const isPcm = state.audioEncoding === "pcm_s16le";
  const blob = isPcm
    ? createWavBlob(segments.flat(), { sampleRate: state.sampleRate, channels: state.channels })
    : createMpegBlob(segments);

  state.stitchedAudio = {
    blob,
    extension: isPcm ? "wav" : "mp3"
  };

  updateDownloadButton();
  setStatus(`Narration fully generated. Continuous ${state.stitchedAudio.extension.toUpperCase()} ready.`);
}

function getGeneratedAudioSegments() {
  const segments = state.segmentAudioChunks
    .filter((segment) => Array.isArray(segment) && segment.length > 0);

  if (segments.length) return segments;
  return state.audioChunks.length ? [state.audioChunks] : [];
}

function downloadAudio() {
  if (!state.stitchedAudio) return;

  const url = URL.createObjectURL(state.stitchedAudio.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.provider}-audiobook.${state.stitchedAudio.extension}`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function updateDownloadButton() {
  const extension = usesPcmPlayback(state.provider) || state.audioEncoding === "pcm_s16le" ? "WAV" : "MP3";
  elements.downloadButton.textContent = `Download ${extension}`;
  elements.downloadButton.disabled = !state.stitchedAudio;
}

function createMpegBlob(segments) {
  const normalizedSegments = segments.map((chunks, index) => {
    const segment = chunks.length === 1 ? chunks[0] : concatArrayBuffers(chunks);
    let start = index === 0 ? 0 : getLeadingId3v2Size(segment);
    let end = segment.byteLength;

    if (index < segments.length - 1) {
      end -= getTrailingId3v1Size(segment);
    }

    if (start >= end) {
      start = 0;
      end = segment.byteLength;
    }

    return start === 0 && end === segment.byteLength
      ? segment
      : segment.slice(start, end);
  });

  return new Blob(normalizedSegments, { type: "audio/mpeg" });
}

function concatArrayBuffers(chunks) {
  const totalBytes = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const combined = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }

  return combined.buffer;
}

function getLeadingId3v2Size(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 10) return 0;
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return 0;

  const tagSize = (
    ((bytes[6] & 0x7f) << 21) |
    ((bytes[7] & 0x7f) << 14) |
    ((bytes[8] & 0x7f) << 7) |
    (bytes[9] & 0x7f)
  );
  const footerSize = bytes[5] & 0x10 ? 10 : 0;
  return Math.min(buffer.byteLength, 10 + tagSize + footerSize);
}

function getTrailingId3v1Size(buffer) {
  if (buffer.byteLength < 128) return 0;

  const marker = new Uint8Array(buffer, buffer.byteLength - 128, 3);
  return marker[0] === 0x54 && marker[1] === 0x41 && marker[2] === 0x47 ? 128 : 0;
}

function createWavBlob(chunks, { sampleRate, channels }) {
  const dataBytes = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const bytesPerSample = 2;
  const byteRate = sampleRate * channels * bytesPerSample;
  const blockAlign = channels * bytesPerSample;

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataBytes, true);

  return new Blob([header, ...chunks], { type: "audio/wav" });
}

function writeAscii(view, offset, value) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function pcmBytesToSeconds(bytes, sampleRate, channels) {
  const bytesPerSecond = sampleRate * channels * 2;
  return bytesPerSecond > 0 ? bytes / bytesPerSecond : 0;
}

async function loadTextFile() {
  const [file] = elements.fileInput.files;
  if (!file) return;

  elements.bookText.value = await file.text();
  updateTextStats();
  setStatus(`Loaded ${file.name}.`);
  elements.fileInput.value = "";
}

function loadSample() {
  elements.bookText.value = SAMPLE_TEXT;
  updateTextStats();
  setStatus("Sample loaded.");
}

function clearText() {
  elements.bookText.value = "";
  updateTextStats();
  elements.bookText.focus();
}

function persistKeyPreference() {
  if (state.provider === "google") {
    sessionStorage.removeItem(PROVIDERS.google.storageKey);
    state.credentialsByProvider.google = "";
    return;
  }

  const config = PROVIDERS[state.provider];
  state.credentialsByProvider[state.provider] = elements.apiKey.value.trim();

  if (elements.rememberKey.checked) {
    sessionStorage.setItem(config.storageKey, state.credentialsByProvider[state.provider]);
  } else {
    sessionStorage.removeItem(config.storageKey);
  }
}

function updateTextStats() {
  const count = elements.bookText.value.trim().length;
  const costPerMillion = PROVIDERS[state.provider].costPerMillionChars;
  elements.charCount.textContent = `${count.toLocaleString()} chars`;
  if (costPerMillion) {
    const estimatedCost = (count / 1_000_000) * costPerMillion;
    elements.costEstimate.textContent = `$${estimatedCost.toFixed(3)} estimated`;
  } else if (state.provider === "gemini") {
    elements.costEstimate.textContent = "Gemini pricing varies by model";
  } else if (state.provider === "google") {
    elements.costEstimate.textContent = "Cloud Gemini-TTS pricing varies by model";
  } else if (state.provider === "openrouter") {
    elements.costEstimate.textContent = "OpenRouter pricing varies by model";
  } else if (state.provider === "resemble") {
    elements.costEstimate.textContent = "Resemble.ai pricing varies by plan";
  } else {
    elements.costEstimate.textContent = "Cloud TTS pricing varies by voice";
  }
}

function updateSpeedLabel() {
  elements.speedValue.textContent = `${Number(elements.speed.value).toFixed(2)}x`;
}

function setBusy(isBusy) {
  elements.startButton.disabled = isBusy;
  elements.stopButton.disabled = !isBusy;
}

function setStatus(message) {
  elements.statusText.textContent = message;
}

function drawWaveform() {
  const canvas = elements.waveCanvas;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const now = performance.now() / 1000;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(0, 0, width, height);

  const lines = 54;
  const center = height * 0.48;
  const baseAmplitude = 24 + state.drawingLevel * 96;

  for (let index = 0; index < lines; index += 1) {
    const x = (index / (lines - 1)) * width;
    const wave = Math.sin(index * 0.58 + now * 2.8) * Math.cos(index * 0.21 + now);
    const amplitude = 22 + Math.abs(wave) * baseAmplitude;

    ctx.beginPath();
    ctx.moveTo(x, center - amplitude);
    ctx.lineTo(x, center + amplitude);
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = index % 3 === 0
      ? "rgba(255, 218, 143, 0.9)"
      : index % 3 === 1
        ? "rgba(175, 224, 214, 0.86)"
        : "rgba(219, 157, 169, 0.78)";
    ctx.stroke();
  }

  state.drawingLevel *= 0.92;
  updateBufferReadout();
  requestAnimationFrame(drawWaveform);
}
