import { activeSegmentLimits, GEMINI_VOICES, isOpenRouterPcmModel, knownModelVoiceGender, PROVIDER_ORDER, PROVIDERS, sortVoiceOptions, voiceGenderLabel } from "../../src/client/config/providers";

describe("provider registry", () => {
  it("contains every supported provider, including the restored Gemini option", () => {
    expect(PROVIDER_ORDER).toEqual(["openrouter", "minimax", "xai", "gemini", "google", "resemble"]);
    expect(Object.keys(PROVIDERS)).toHaveLength(6);
  });

  it("applies the quality-first OpenRouter Gemini segment limits", () => {
    expect(isOpenRouterPcmModel("google/gemini-tts")).toBe(true);
    expect(activeSegmentLimits("openrouter", "google/gemini-tts")).toEqual({ defaultSegmentChars: 500, maxSegmentChars: 4500 });
    expect(activeSegmentLimits("openrouter", "mistral/voxtral-mini-tts")).toEqual({ defaultSegmentChars: 2500, maxSegmentChars: 12000 });
    expect(PROVIDERS.gemini.defaultSegmentChars).toBe(500);
    expect(PROVIDERS.google.defaultSegmentChars).toBe(500);
    expect(PROVIDERS.xai.defaultSegmentChars).toBe(2500);
  });

  it("sorts voices and maps provider gender metadata to consistent text labels", () => {
    expect(sortVoiceOptions([{ value: "z", label: "Zulu" }, { value: "a", label: "alpha" }]).map(({ value }) => value)).toEqual(["a", "z"]);
    expect(voiceGenderLabel("female")).toBe("Female");
    expect(voiceGenderLabel("male")).toBe("Male");
    expect(voiceGenderLabel("neutral")).toBe("Neutral");
    expect(voiceGenderLabel("unsupported-value")).toBe("");
    expect(GEMINI_VOICES.every((voice) => Boolean(voice.gender))).toBe(true);
    expect(knownModelVoiceGender("google/gemini-tts", "Kore")).toBe("female");
    expect(knownModelVoiceGender("x-ai/grok-tts", "sal")).toBe("neutral");
  });
});
