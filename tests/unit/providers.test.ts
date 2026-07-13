import { activeSegmentLimits, isOpenRouterPcmModel, PROVIDER_ORDER, PROVIDERS, sortVoiceOptions, voiceGenderIcon } from "../../src/client/config/providers";

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

  it("sorts voices alphabetically and maps gender metadata to compact icons", () => {
    expect(sortVoiceOptions([{ value: "z", label: "Zulu" }, { value: "a", label: "alpha" }]).map(({ value }) => value)).toEqual(["a", "z"]);
    expect(voiceGenderIcon("female")).toBe("♀");
    expect(voiceGenderIcon("male")).toBe("♂");
    expect(voiceGenderIcon("neutral")).toBe("⚥");
  });
});
