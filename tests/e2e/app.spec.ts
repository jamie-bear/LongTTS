import { expect, test, type Page } from "@playwright/test";

async function mockBaseApis(page: Page) {
  await page.route("**/api/google-oauth/status", (route) => route.fulfill({ json: { configured: true, connected: true, updatedAt: "2026-07-13T12:00:00.000Z" } }));
  await page.route("**/api/openrouter/models", (route) => route.fulfill({ json: { models: [{ id: "mistral/voxtral-mini-tts", name: "Voxtral Mini TTS", voices: [{ value: "alloy", label: "Alloy" }] }] } }));
  await page.route("**/api/resemble/voices", (route) => route.fulfill({ json: { voices: [{ id: "resemble-voice", name: "Resemble Narrator" }] } }));
  await page.route("**/api/minimax/voices", (route) => route.fulfill({ json: { voices: [{ id: "minimax-voice", name: "MiniMax Narrator", model: "speech-2.8-hd" }] } }));
}

test.beforeEach(async ({ page, context }) => {
  await context.routeWebSocket(/\/stream$/, (socket) => {
    socket.onMessage((message) => {
      const command = JSON.parse(String(message));
      if (command.type !== "start") return;
      socket.send(JSON.stringify({ type: "meta", provider: command.options.provider, audioEncoding: "mpeg", sampleRate: 24000, channels: 1, totalChars: 11, totalSegments: 1, segmentChars: command.options.segmentChars }));
      socket.send(JSON.stringify({ type: "segment", index: 1, totalSegments: 1 }));
      socket.send(JSON.stringify({ type: "segmentDone", index: 1, totalSegments: 1 }));
      socket.send(JSON.stringify({ type: "complete" }));
    });
  });
  await mockBaseApis(page);
  await page.goto("/");
});

test("keeps the desktop and mobile shells free of horizontal page overflow", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "LongTTS" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("matches the visual-parity baseline", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "LongTTS" })).toBeVisible();
  await expect(page).toHaveScreenshot("app-shell.png", {
    fullPage: true,
    animations: "disabled",
    mask: [page.locator("#waveCanvas")],
    maxDiffPixelRatio: 0.002
  });
});

for (const provider of ["openrouter", "minimax", "xai", "gemini", "google", "resemble"] as const) {
  test(`${provider} retains its provider-specific controls`, async ({ page }) => {
    await page.getByLabel("Provider").selectOption(provider);
    if (provider !== "google") await page.locator("#apiKey").fill("test-key");
    if (provider === "openrouter") await expect(page.getByLabel("OpenRouter model")).toBeEnabled();
    if (provider === "minimax") await expect(page.getByLabel("MiniMax speech model")).toBeVisible();
    if (provider === "google") await expect(page.getByText("Google connected")).toBeVisible();
    if (provider === "xai") await expect(page.getByLabel("Normalize numbers and abbreviations")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start narration" })).toBeEnabled();
  });
}

test("mocked WebSocket events drive narration progress and completion", async ({ page }) => {
  await page.getByLabel("Provider").selectOption("xai");
  await page.getByLabel("xAI API key").fill("test-key");
  await page.getByLabel("Book or chapter text").fill("Hello world");
  await page.getByRole("button", { name: "Start narration" }).click();
  await expect(page.getByText("1 / 1 segments")).toBeVisible();
  await expect(page.getByText("Narration fully generated, but no audio was received.")).toBeVisible();
});
