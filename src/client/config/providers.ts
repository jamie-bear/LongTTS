import type { ProviderConfig, ProviderId, SelectOption } from "../types/contracts";

export const GEMINI_VOICES: SelectOption[] = [
  ["Kore", "Firm"], ["Puck", "Upbeat"], ["Aoede", "Breezy"], ["Charon", "Informative"],
  ["Zephyr", "Bright"], ["Fenrir", "Excitable"], ["Leda", "Youthful"], ["Orus", "Firm"],
  ["Callirrhoe", "Easy-going"], ["Autonoe", "Bright"], ["Enceladus", "Breathy (Male)"],
  ["Iapetus", "Clear"], ["Umbriel", "Easy-going"], ["Algieba", "Smooth"], ["Despina", "Smooth"],
  ["Erinome", "Clear"], ["Algenib", "Gravelly"], ["Rasalgethi", "Informative"],
  ["Laomedeia", "Upbeat"], ["Achernar", "Soft"], ["Alnilam", "Firm"], ["Schedar", "Even"],
  ["Gacrux", "Mature"], ["Pulcherrima", "Forward"], ["Achird", "Friendly"],
  ["Zubenelgenubi", "Casual"], ["Vindemiatrix", "Gentle"], ["Sadachbia", "Lively"],
  ["Sadaltager", "Knowledgeable"], ["Sulafat", "Warm"]
].map(([value, quality]) => ({ value, label: `${value} - ${quality}` }));

const optionList = (entries: Array<[string, string]>): SelectOption[] => entries.map(([value, label]) => ({ value, label }));
const autoOnly = optionList([["auto", "Auto"]]);

const xaiLanguages = optionList([
  ["auto", "Auto"], ["en", "English"], ["de", "German"], ["fr", "French"], ["it", "Italian"],
  ["es-ES", "Spanish (Spain)"], ["es-MX", "Spanish (Mexico)"], ["pt-BR", "Portuguese (Brazil)"],
  ["pt-PT", "Portuguese (Portugal)"], ["zh", "Chinese"], ["ja", "Japanese"], ["ko", "Korean"],
  ["hi", "Hindi"], ["id", "Indonesian"], ["tr", "Turkish"], ["vi", "Vietnamese"], ["ru", "Russian"],
  ["bn", "Bengali"], ["ar-EG", "Arabic (Egypt)"], ["ar-SA", "Arabic (Saudi Arabia)"], ["ar-AE", "Arabic (UAE)"]
]);

export const MINIMAX_LANGUAGES = optionList([
  ["auto", "Auto"], ["English", "English"], ["Chinese", "Chinese"], ["Chinese,Yue", "Chinese (Cantonese)"],
  ["Spanish", "Spanish"], ["French", "French"], ["Portuguese", "Portuguese"], ["German", "German"],
  ["Arabic", "Arabic"], ["Russian", "Russian"], ["Japanese", "Japanese"], ["Italian", "Italian"],
  ["Korean", "Korean"], ["Hindi", "Hindi"], ["Turkish", "Turkish"], ["Dutch", "Dutch"],
  ["Ukrainian", "Ukrainian"], ["Vietnamese", "Vietnamese"], ["Indonesian", "Indonesian"], ["Thai", "Thai"],
  ["Polish", "Polish"], ["Romanian", "Romanian"], ["Greek", "Greek"], ["Czech", "Czech"], ["Finnish", "Finnish"]
]);

const providers: ProviderConfig[] = [
  {
    id: "openrouter", label: "OpenRouter: Various Models", storageKey: "openrouterApiKey",
    credentialLabel: "OpenRouter API key", credentialPlaceholder: "sk-or-...", authMode: "api-key",
    defaultVoice: "alloy", defaultLanguage: "auto", defaultSegmentChars: 4500, maxSegmentChars: 12000,
    voices: [{ value: "", label: "Select a model to load voices" }], languages: autoOnly
  },
  {
    id: "minimax", label: "MiniMax: Custom Voices", storageKey: "minimaxApiKey",
    credentialLabel: "MiniMax API key", credentialPlaceholder: "MiniMax API key", authMode: "api-key",
    defaultVoice: "", defaultLanguage: "auto", defaultSegmentChars: 4500, maxSegmentChars: 10000,
    costPerMillionChars: 30, voices: [{ value: "", label: "Create or refresh MiniMax custom voices" }], languages: MINIMAX_LANGUAGES.slice(0, 14)
  },
  {
    id: "xai", label: "xAI: Grok TTS 1.0", storageKey: "xaiApiKey", credentialLabel: "xAI API key",
    credentialPlaceholder: "xai-...", authMode: "api-key", defaultVoice: "eve", defaultLanguage: "auto",
    defaultSegmentChars: 4500, maxSegmentChars: 12000, costPerMillionChars: 15,
    supportsLowLatency: true, supportsTextNormalization: true,
    voices: optionList([["eve", "Eve"], ["ara", "Ara"], ["leo", "Leo"], ["rex", "Rex"], ["sal", "Sal"]]),
    languages: xaiLanguages
  },
  {
    id: "gemini", label: "Gemini API: Gemini 3.1 Flash TTS (Preview)", storageKey: "geminiApiKey",
    credentialLabel: "Gemini API key", credentialPlaceholder: "AI Studio API key", authMode: "api-key",
    defaultVoice: "Enceladus", defaultLanguage: "auto", defaultSegmentChars: 500, maxSegmentChars: 12000,
    voices: GEMINI_VOICES, languages: autoOnly
  },
  {
    id: "google", label: "Google: Gemini 3.1 Flash TTS (Preview)", storageKey: "googleTtsCredential",
    credentialLabel: "", credentialPlaceholder: "", authMode: "google-oauth", defaultVoice: "Enceladus",
    defaultLanguage: "en-US", defaultSegmentChars: 500, maxSegmentChars: 4500, voices: GEMINI_VOICES,
    languages: optionList([["en-US", "English (US)"], ["en-GB", "English (UK)"], ["de-DE", "German (Germany)"],
      ["fr-FR", "French (France)"], ["it-IT", "Italian (Italy)"], ["es-ES", "Spanish (Spain)"],
      ["pt-BR", "Portuguese (Brazil)"], ["ja-JP", "Japanese"], ["ko-KR", "Korean"]])
  },
  {
    id: "resemble", label: "Resemble.ai: Custom Voices", storageKey: "resembleApiKey",
    credentialLabel: "Resemble.ai API key", credentialPlaceholder: "Bearer token", authMode: "api-key",
    defaultVoice: "", defaultLanguage: "auto", defaultSegmentChars: 4500, maxSegmentChars: 12000,
    voices: [{ value: "", label: "Enter a Resemble.ai API key to load custom voices" }], languages: autoOnly
  }
];

export const PROVIDER_ORDER = providers.map(({ id }) => id);
export const PROVIDERS = Object.fromEntries(providers.map((provider) => [provider.id, provider])) as Record<ProviderId, ProviderConfig>;
export const SEGMENT_OPTIONS = optionList([["500", "Very short"], ["1200", "Short"], ["2500", "Balanced"], ["4500", "Long"], ["8000", "Very long"], ["12000", "Maximum"]]);
export const MINIMAX_MODELS = ["speech-2.8-hd", "speech-2.8-turbo", "speech-2.6-hd", "speech-2.6-turbo", "speech-02-hd", "speech-02-turbo", "speech-01-hd", "speech-01-turbo"];

export const isProviderId = (value: string | null): value is ProviderId => Boolean(value && value in PROVIDERS);
export const isVoxtralModel = (modelId: string) => /voxtral/i.test(modelId);
export const isOpenRouterPcmModel = (modelId: string) => /(^|[/:-])(?:google|gemini)(?:[/:-]|$)/i.test(modelId);

export function activeSegmentLimits(provider: ProviderId, model: string) {
  const config = PROVIDERS[provider];
  return provider === "openrouter" && isOpenRouterPcmModel(model)
    ? { defaultSegmentChars: 500, maxSegmentChars: 4500 }
    : { defaultSegmentChars: config.defaultSegmentChars, maxSegmentChars: config.maxSegmentChars };
}
