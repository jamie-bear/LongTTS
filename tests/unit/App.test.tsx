import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import App from "../../src/client/App";

describe("LongTTS application shell", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("google-oauth/status")) return new Response(JSON.stringify({ configured: false, connected: false }), { status: 200 });
      return new Response(JSON.stringify({ models: [], voices: [] }), { status: 200 });
    }));
  });

  it("renders the current hierarchy and all supported providers", async () => {
    render(<App />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.getByRole("heading", { name: /Long\s*TTS/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Gemini API: Gemini 3.1 Flash TTS (Preview)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start narration" })).toBeEnabled();
  });

  it("loads and clears the sample while updating text statistics", async () => {
    render(<App />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Sample" }));
    expect((screen.getByLabelText("Book or chapter text") as HTMLTextAreaElement).value).toContain("Chapter One");
    expect(screen.getByLabelText("Text statistics")).not.toHaveTextContent("0 chars");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("Book or chapter text")).toHaveValue("");
  });

  it("switches provider capabilities without leaking xAI-only settings", async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Provider"), { target: { value: "xai" } });
    expect(screen.getByLabelText("Optimize first audio chunk")).toBeInTheDocument();
    expect(screen.getByLabelText("Normalize numbers and abbreviations")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Provider"), { target: { value: "google" } });
    expect(screen.queryByLabelText("Optimize first audio chunk")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Google OAuth is not configured")).toBeInTheDocument());
  });
});
