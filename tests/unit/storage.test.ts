import { readCredentials, readProvider, readVoiceClones, writeCredential, writeVoiceClones } from "../../src/client/services/storage";

describe("storage compatibility", () => {
  it("keeps the established provider and credential keys", () => {
    sessionStorage.setItem("ttsProvider", "xai");
    sessionStorage.setItem("xaiApiKey", "xai-test");
    expect(readProvider()).toBe("xai");
    expect(readCredentials().xai).toBe("xai-test");
    writeCredential("xai", "replacement", true);
    expect(sessionStorage.getItem("xaiApiKey")).toBe("replacement");
  });

  it("round-trips local clone metadata and tolerates invalid JSON", () => {
    writeVoiceClones("minimaxVoiceClones", [{ id: "voice-1", name: "Narrator" }]);
    expect(readVoiceClones("minimaxVoiceClones")).toEqual([{ id: "voice-1", name: "Narrator" }]);
    localStorage.setItem("minimaxVoiceClones", "not-json");
    expect(readVoiceClones("minimaxVoiceClones")).toEqual([]);
  });
});
