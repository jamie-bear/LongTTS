import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import tls from "node:tls";
import { EventEmitter } from "node:events";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync, promises as fs } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");

loadDotEnv(path.join(rootDir, ".env"));

const PORT = Number(process.env.PORT || 10203);
const XAI_TTS_URL = "wss://api.x.ai/v1/tts";
const GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";
const GOOGLE_OAUTH_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const GOOGLE_OAUTH_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const GOOGLE_OAUTH_CLIENT_ID = String(process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
const GOOGLE_OAUTH_CLIENT_SECRET = String(process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim();
const GOOGLE_OAUTH_REDIRECT_URI = String(process.env.GOOGLE_OAUTH_REDIRECT_URI || "").trim();
const GOOGLE_OAUTH_TOKEN_PATH = path.resolve(rootDir, process.env.GOOGLE_OAUTH_TOKEN_PATH || ".secrets/google-oauth-token.json");
const GOOGLE_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const GEMINI_TTS_MODEL = "gemini-3.1-flash-tts-preview";
const GEMINI_TTS_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent`;
const GEMINI_SAMPLE_RATE = 24_000;
const GEMINI_TTS_VOICES = new Set([
  "Zephyr",
  "Puck",
  "Charon",
  "Kore",
  "Fenrir",
  "Leda",
  "Orus",
  "Aoede",
  "Callirrhoe",
  "Autonoe",
  "Enceladus",
  "Iapetus",
  "Umbriel",
  "Algieba",
  "Despina",
  "Erinome",
  "Algenib",
  "Rasalgethi",
  "Laomedeia",
  "Achernar",
  "Alnilam",
  "Schedar",
  "Gacrux",
  "Pulcherrima",
  "Achird",
  "Zubenelgenubi",
  "Vindemiatrix",
  "Sadachbia",
  "Sadaltager",
  "Sulafat"
]);
const MAX_DELTA_CHARS = 14_500;
const DEFAULT_SEGMENT_CHARS = 4_500;
const GOOGLE_DEFAULT_SEGMENT_CHARS = 500;
const GEMINI_DEFAULT_SEGMENT_CHARS = 500;
const MAX_SEGMENT_CHARS = 12_000;
const GOOGLE_MAX_SEGMENT_CHARS = 4_500;
const GOOGLE_MAX_SEGMENT_BYTES = 3_900;
const MIN_SEGMENT_CHARS = 300;
const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const googleAccessTokenCache = new Map();
const googleOAuthStates = new Map();
let googleOAuthTokenCache = null;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (url.pathname === "/api/google-oauth/status") {
      await handleGoogleOAuthStatus(req, res);
      return;
    }

    if (url.pathname === "/api/google-oauth/disconnect") {
      await handleGoogleOAuthDisconnect(req, res);
      return;
    }

    if (url.pathname === "/auth/google/start") {
      await startGoogleOAuth(req, res);
      return;
    }

    if (url.pathname === "/oauth/google/callback") {
      await finishGoogleOAuth(req, res, url);
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    console.error(error);
    sendText(res, 500, "Internal server error");
  }
});

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname !== "/stream") {
    socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }

  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.write("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }

  const accept = crypto
    .createHash("sha1")
    .update(`${key}${WS_GUID}`)
    .digest("base64");

  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "\r\n"
  ].join("\r\n"));

  const client = new WebSocketConnection(socket, {
    expectMaskedFrames: true,
    maskOutgoingFrames: false
  });

  if (head.length) {
    client.consume(head);
  }

  const session = createNarrationSession(client);

  client.on("message", (raw) => {
    if (Buffer.isBuffer(raw)) return;

    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      sendJsonWs(client, { type: "error", message: "Invalid JSON message." });
      return;
    }

    session.handleClientMessage(message);
  });

  client.on("close", () => session.cancel("Client disconnected."));
  client.on("error", () => session.cancel("Client socket errored."));
});

server.listen(PORT, () => {
  console.log(`TTS Audiobook Studio is running at http://localhost:${PORT}`);
});

async function handleGoogleOAuthStatus(req, res) {
  const storedToken = await readGoogleOAuthTokenFile();
  sendJson(res, 200, {
    configured: hasGoogleOAuthConfig(),
    connected: Boolean(storedToken?.refreshToken),
    redirectUri: getGoogleOAuthRedirectUri(req),
    scope: storedToken?.scope || GOOGLE_OAUTH_SCOPE,
    updatedAt: storedToken?.updatedAt || null
  });
}

async function handleGoogleOAuthDisconnect(req, res) {
  if (req.method !== "POST") {
    res.writeHead(405, {
      "Content-Type": "application/json; charset=utf-8",
      Allow: "POST"
    });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const storedToken = await readGoogleOAuthTokenFile();
  if (storedToken?.refreshToken && hasGoogleOAuthConfig()) {
    revokeGoogleOAuthToken(storedToken.refreshToken).catch((error) => {
      console.warn(`Google OAuth token revocation failed: ${error.message}`);
    });
  }

  await deleteGoogleOAuthTokenFile();
  sendJson(res, 200, { ok: true, connected: false });
}

async function startGoogleOAuth(req, res) {
  if (!hasGoogleOAuthConfig()) {
    sendGoogleOAuthResult(res, 500, {
      title: "Google OAuth is not configured",
      message: "Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to .env, restart the app, then try again.",
      success: false
    });
    return;
  }

  cleanupExpiredGoogleOAuthStates();

  const state = crypto.randomBytes(24).toString("base64url");
  const codeVerifier = crypto.randomBytes(48).toString("base64url");
  const codeChallenge = base64Url(crypto.createHash("sha256").update(codeVerifier).digest());
  const redirectUri = getGoogleOAuthRedirectUri(req);

  googleOAuthStates.set(state, {
    codeVerifier,
    redirectUri,
    expiresAt: Date.now() + GOOGLE_OAUTH_STATE_TTL_MS
  });

  const authUrl = new URL(GOOGLE_OAUTH_AUTH_URL);
  authUrl.searchParams.set("client_id", GOOGLE_OAUTH_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", GOOGLE_OAUTH_SCOPE);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("include_granted_scopes", "true");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  res.writeHead(302, { Location: authUrl.href });
  res.end();
}

async function finishGoogleOAuth(req, res, url) {
  const error = url.searchParams.get("error");
  if (error) {
    sendGoogleOAuthResult(res, 400, {
      title: "Google OAuth was cancelled",
      message: url.searchParams.get("error_description") || error,
      success: false
    });
    return;
  }

  const state = url.searchParams.get("state") || "";
  const code = url.searchParams.get("code") || "";
  const pendingState = googleOAuthStates.get(state);
  googleOAuthStates.delete(state);

  if (!code || !pendingState || pendingState.expiresAt < Date.now()) {
    sendGoogleOAuthResult(res, 400, {
      title: "Google OAuth could not be completed",
      message: "The login response was missing or expired. Start the connection again from the app.",
      success: false
    });
    return;
  }

  try {
    const tokenBody = await requestGoogleOAuthToken(new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: pendingState.redirectUri,
      code_verifier: pendingState.codeVerifier
    }));

    if (!tokenBody.refresh_token) {
      const existingToken = await readGoogleOAuthTokenFile();
      if (!existingToken?.refreshToken) {
        throw new Error("Google did not return a refresh token. Reconnect with consent, or remove this app from your Google account and try again.");
      }
    }

    await writeGoogleOAuthTokenFile(tokenBody);
    sendGoogleOAuthResult(res, 200, {
      title: "Google is connected",
      message: "You can close this tab and return to TTS Audiobook Studio.",
      success: true
    });
  } catch (exchangeError) {
    sendGoogleOAuthResult(res, 500, {
      title: "Google OAuth failed",
      message: exchangeError.message,
      success: false
    });
  }
}

function hasGoogleOAuthConfig() {
  return Boolean(GOOGLE_OAUTH_CLIENT_ID && GOOGLE_OAUTH_CLIENT_SECRET);
}

function getGoogleOAuthRedirectUri(req) {
  if (GOOGLE_OAUTH_REDIRECT_URI) return GOOGLE_OAUTH_REDIRECT_URI;

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const protocol = forwardedProto || "http";
  const host = req.headers.host || `localhost:${PORT}`;
  return `${protocol}://${host}/oauth/google/callback`;
}

function cleanupExpiredGoogleOAuthStates() {
  const now = Date.now();
  for (const [state, pendingState] of googleOAuthStates) {
    if (pendingState.expiresAt < now) {
      googleOAuthStates.delete(state);
    }
  }
}

async function hasGoogleOAuthRefreshToken() {
  const token = await readGoogleOAuthTokenFile();
  return Boolean(token?.refreshToken);
}

async function getGoogleOAuthAccessToken(signal) {
  if (!hasGoogleOAuthConfig()) {
    throw new Error("Google OAuth is not configured. Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to .env, then restart the app.");
  }

  const storedToken = await readGoogleOAuthTokenFile();
  if (!storedToken?.refreshToken) {
    throw new Error("Google OAuth is not connected. Use the Connect Google button first.");
  }

  if (storedToken.accessToken && storedToken.expiresAt > Date.now() + 60_000) {
    return storedToken.accessToken;
  }

  const tokenBody = await requestGoogleOAuthToken(new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: storedToken.refreshToken,
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    client_secret: GOOGLE_OAUTH_CLIENT_SECRET
  }), signal);
  const updatedToken = await writeGoogleOAuthTokenFile(tokenBody, storedToken);
  return updatedToken.accessToken;
}

async function requestGoogleOAuthToken(body, signal) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body,
    signal
  });

  let parsed;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message = parsed?.error_description || parsed?.error || `${response.status} ${response.statusText}`;
    throw new Error(`Google OAuth token request failed: ${message}`);
  }

  if (!parsed?.access_token) {
    throw new Error("Google OAuth token response did not include an access token.");
  }

  return parsed;
}

async function revokeGoogleOAuthToken(refreshToken) {
  await fetch(GOOGLE_REVOKE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ token: refreshToken })
  });
}

async function readGoogleOAuthTokenFile() {
  if (googleOAuthTokenCache) return googleOAuthTokenCache;

  let raw;
  try {
    raw = await fs.readFile(GOOGLE_OAUTH_TOKEN_PATH, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Google OAuth token file is not valid JSON: ${GOOGLE_OAUTH_TOKEN_PATH}`);
  }

  googleOAuthTokenCache = {
    refreshToken: String(parsed.refreshToken || ""),
    accessToken: String(parsed.accessToken || ""),
    expiresAt: Number(parsed.expiresAt || 0),
    scope: String(parsed.scope || GOOGLE_OAUTH_SCOPE),
    tokenType: String(parsed.tokenType || "Bearer"),
    updatedAt: String(parsed.updatedAt || "")
  };

  return googleOAuthTokenCache.refreshToken ? googleOAuthTokenCache : null;
}

async function writeGoogleOAuthTokenFile(tokenBody, existingToken = null) {
  const existing = existingToken || await readGoogleOAuthTokenFile() || {};
  const expiresIn = Number(tokenBody.expires_in || 3600);
  const storedToken = {
    refreshToken: tokenBody.refresh_token || existing.refreshToken || "",
    accessToken: tokenBody.access_token || existing.accessToken || "",
    expiresAt: Date.now() + Math.max(60, expiresIn - 30) * 1000,
    scope: tokenBody.scope || existing.scope || GOOGLE_OAUTH_SCOPE,
    tokenType: tokenBody.token_type || existing.tokenType || "Bearer",
    updatedAt: new Date().toISOString()
  };

  if (!storedToken.refreshToken) {
    throw new Error("Cannot store Google OAuth credentials without a refresh token.");
  }

  await fs.mkdir(path.dirname(GOOGLE_OAUTH_TOKEN_PATH), { recursive: true });
  await fs.writeFile(GOOGLE_OAUTH_TOKEN_PATH, `${JSON.stringify(storedToken, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600
  });

  googleOAuthTokenCache = storedToken;
  return storedToken;
}

async function deleteGoogleOAuthTokenFile() {
  googleOAuthTokenCache = null;

  try {
    await fs.unlink(GOOGLE_OAUTH_TOKEN_PATH);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function sendGoogleOAuthResult(res, status, { title, message, success }) {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const script = success
    ? "<script>window.opener?.postMessage({ type: 'google-oauth-complete' }, window.location.origin); window.setTimeout(() => window.close(), 1200);</script>"
    : "";

  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeTitle}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: system-ui, sans-serif; color: #17201c; background: #f5f7f2; }
      main { max-width: 520px; padding: 32px; }
      h1 { margin: 0 0 12px; font-size: 2rem; }
      p { margin: 0; line-height: 1.5; color: #60706a; }
    </style>
  </head>
  <body>
    <main>
      <h1>${safeTitle}</h1>
      <p>${safeMessage}</p>
    </main>
    ${script}
  </body>
</html>`);
}

function createNarrationSession(client) {
  const state = {
    active: false,
    cancelled: false,
    upstream: null,
    currentRequest: null,
    apiKey: "",
    options: {},
    segments: [],
    segmentIndex: 0,
    waitingForAudioDone: false,
    currentSegmentBytes: 0,
    totalBytes: 0,
    lastByteReportAt: 0
  };

  return {
    handleClientMessage(message) {
      if (message.type === "start") {
        start(message).catch((error) => fail(error));
        return;
      }

      if (message.type === "telemetry") {
        // Playback telemetry is display-only; generation should keep moving.
        return;
      }

      if (message.type === "cancel") {
        cancel("Narration stopped.");
      }
    },
    cancel
  };

  async function start(message) {
    if (state.active) {
      cancel("Restarting narration.");
    }

    const apiKey = String(message.apiKey || "").trim();
    const text = normalizeText(String(message.text || ""));
    const options = sanitizeOptions(message.options || {});

    if (!apiKey) {
      if (options.provider !== "google" || !(await hasGoogleOAuthRefreshToken())) {
        throw new Error(options.provider === "google"
          ? "Connect Google before starting narration."
          : `Add your ${providerLabel(options.provider)} credential before starting narration.`);
      }
    }

    if (!text) {
      throw new Error("Paste text or load a .txt file before starting narration.");
    }

    state.active = true;
    state.cancelled = false;
    state.apiKey = apiKey;
    state.options = options;
    state.segmentIndex = 0;
    state.waitingForAudioDone = false;
    state.currentSegmentBytes = 0;
    state.totalBytes = 0;
    state.segments = splitText(text, options.segmentChars, options.maxSegmentBytes);

    sendJsonWs(client, {
      type: "meta",
      provider: options.provider,
      audioEncoding: getProviderAudioEncoding(options.provider),
      sampleRate: getProviderSampleRate(options.provider),
      channels: 1,
      totalChars: text.length,
      totalSegments: state.segments.length,
      segmentChars: options.segmentChars
    });

    if (options.provider === "google") {
      sendJsonWs(client, { type: "status", message: `Using Google Cloud Gemini-TTS (${GEMINI_TTS_MODEL}).` });
    } else if (options.provider === "gemini") {
      sendJsonWs(client, { type: "status", message: "Using Gemini Developer API TTS." });
    } else {
      await connectUpstream();
    }

    await pumpNextSegment();
  }

  async function connectUpstream() {
    if (state.options.provider !== "xai") return;

    const url = buildXaiUrl(state.options);
    if (state.upstream?.readyState === WebSocketConnection.OPEN) return;
    if (state.upstream?.readyState === WebSocketConnection.CONNECTING) return;

    const upstream = await connectXaiWebSocket(url, state.apiKey);
    state.upstream = upstream;

    upstream.on("message", (raw) => handleUpstreamMessage(raw).catch((error) => fail(error)));
    upstream.on("error", (error) => fail(new Error(`xAI WebSocket error: ${error.message}`)));
    upstream.on("close", ({ code, reason }) => {
      if (state.active && state.waitingForAudioDone && !state.cancelled) {
        fail(new Error(`xAI WebSocket closed before audio finished (${code} ${reason || ""}).`));
      }
    });

    sendJsonWs(client, { type: "status", message: "Connected to xAI streaming TTS." });
  }

  async function pumpNextSegment() {
    if (!state.active || state.cancelled || state.waitingForAudioDone) return;

    if (state.segmentIndex >= state.segments.length) {
      finish();
      return;
    }

    await connectUpstream();
    await sendSegment(state.segments[state.segmentIndex]);
  }

  async function sendSegment(segment) {
    state.waitingForAudioDone = true;
    state.currentSegmentBytes = 0;

    sendJsonWs(client, {
      type: "segment",
      index: state.segmentIndex + 1,
      totalSegments: state.segments.length,
      chars: segment.length,
      preview: segment.slice(0, 140)
    });

    if (state.options.provider === "google") {
      await synthesizeGoogleSegment(segment);
      return;
    }

    if (state.options.provider === "gemini") {
      await synthesizeGeminiSegment(segment);
      return;
    }

    const upstream = state.upstream;
    if (!upstream || upstream.readyState !== WebSocketConnection.OPEN) {
      throw new Error("xAI connection is not open.");
    }

    for (const delta of splitFixed(segment, MAX_DELTA_CHARS)) {
      upstream.send(JSON.stringify({ type: "text.delta", delta }));
    }

    upstream.send(JSON.stringify({ type: "text.done" }));
  }

  async function synthesizeGoogleSegment(segment) {
    const controller = new AbortController();
    state.currentRequest = controller;

    try {
      const chunk = await synthesizeGoogleSpeech(segment, state.options, state.apiKey, controller.signal);
      if (state.cancelled) return;

      state.currentSegmentBytes = chunk.length;
      state.totalBytes += chunk.length;

      if (client.readyState === WebSocketConnection.OPEN) {
        client.send(chunk, { binary: true });
      }

      state.waitingForAudioDone = false;
      reportBytes(true);

      sendJsonWs(client, {
        type: "segmentDone",
        index: state.segmentIndex + 1,
        totalSegments: state.segments.length,
        traceId: null,
        bytes: state.currentSegmentBytes
      });

      state.segmentIndex += 1;
      await pumpNextSegment();
    } finally {
      if (state.currentRequest === controller) {
        state.currentRequest = null;
      }
    }
  }

  async function synthesizeGeminiSegment(segment) {
    const controller = new AbortController();
    state.currentRequest = controller;

    try {
      const chunk = await synthesizeGeminiSpeech(segment, state.options, state.apiKey, controller.signal);
      if (state.cancelled) return;

      state.currentSegmentBytes = chunk.length;
      state.totalBytes += chunk.length;

      if (client.readyState === WebSocketConnection.OPEN) {
        client.send(chunk, { binary: true });
      }

      state.waitingForAudioDone = false;
      reportBytes(true);

      sendJsonWs(client, {
        type: "segmentDone",
        index: state.segmentIndex + 1,
        totalSegments: state.segments.length,
        traceId: null,
        bytes: state.currentSegmentBytes
      });

      state.segmentIndex += 1;
      await pumpNextSegment();
    } finally {
      if (state.currentRequest === controller) {
        state.currentRequest = null;
      }
    }
  }

  async function handleUpstreamMessage(raw) {
    let event;
    try {
      event = JSON.parse(raw.toString());
    } catch {
      throw new Error("Received a non-JSON message from xAI.");
    }

    if (event.type === "audio.delta") {
      const chunk = Buffer.from(event.delta || "", "base64");
      state.currentSegmentBytes += chunk.length;
      state.totalBytes += chunk.length;

      if (client.readyState === WebSocketConnection.OPEN) {
        client.send(chunk, { binary: true });
      }

      reportBytes(false);
      return;
    }

    if (event.type === "audio.done") {
      state.waitingForAudioDone = false;
      reportBytes(true);

      sendJsonWs(client, {
        type: "segmentDone",
        index: state.segmentIndex + 1,
        totalSegments: state.segments.length,
        traceId: event.trace_id || null,
        bytes: state.currentSegmentBytes
      });

      state.segmentIndex += 1;
      await pumpNextSegment();
      return;
    }

    if (event.type === "audio.clear") {
      sendJsonWs(client, { type: "cleared" });
      return;
    }

    if (event.type === "error") {
      throw new Error(event.message || "xAI returned an unknown TTS error.");
    }
  }

  function reportBytes(force) {
    const now = Date.now();
    if (!force && now - state.lastByteReportAt < 500) return;
    state.lastByteReportAt = now;

    sendJsonWs(client, {
      type: "bytes",
      totalBytes: state.totalBytes,
      currentSegmentBytes: state.currentSegmentBytes
    });
  }

  function finish() {
    if (!state.active) return;

    state.active = false;
    sendJsonWs(client, {
      type: "complete",
      totalBytes: state.totalBytes,
      totalSegments: state.segments.length
    });

    closeUpstream();
  }

  function cancel(reason) {
    if (state.cancelled) return;

    state.cancelled = true;
    state.active = false;

    if (state.currentRequest) {
      state.currentRequest.abort();
      state.currentRequest = null;
    }

    if (state.options.provider === "xai" && state.upstream?.readyState === WebSocketConnection.OPEN) {
      try {
        state.upstream.send(JSON.stringify({ type: "text.clear" }));
      } catch {
        // The upstream connection is already going away.
      }
    }

    closeUpstream();
    sendJsonWs(client, { type: "cancelled", message: reason });
  }

  function fail(error) {
    if (state.cancelled) return;

    state.active = false;
    closeUpstream();
    sendJsonWs(client, { type: "error", message: error.message || String(error) });
  }

  function closeUpstream() {
    if (state.currentRequest) {
      state.currentRequest.abort();
      state.currentRequest = null;
    }

    const upstream = state.upstream;
    state.upstream = null;

    if (upstream && upstream.readyState === WebSocketConnection.OPEN) {
      upstream.close(1000, "Narration session ended.");
    } else if (upstream && upstream.readyState === WebSocketConnection.CONNECTING) {
      upstream.terminate();
    }
  }
}

function sanitizeOptions(raw) {
  const provider = sanitizeProvider(raw.provider);
  const defaultVoice = provider === "google"
    ? "Enceladus"
    : provider === "gemini"
      ? "Enceladus"
      : "eve";
  const voice = sanitizeVoice(raw.voice, defaultVoice, provider);
  const language = sanitizeLanguage(raw.language, provider, voice);
  const speed = clamp(Number(raw.speed || 1), 0.7, 1.5);
  const defaultSegmentChars = getDefaultSegmentChars(provider);
  const maxSegmentChars = provider === "google" ? GOOGLE_MAX_SEGMENT_CHARS : MAX_SEGMENT_CHARS;
  const segmentChars = Math.round(clamp(Number(raw.segmentChars || defaultSegmentChars), MIN_SEGMENT_CHARS, maxSegmentChars));
  const optimizeStreamingLatency = raw.optimizeStreamingLatency ? 1 : 0;
  const textNormalization = provider === "xai" && Boolean(raw.textNormalization);

  return {
    provider,
    voice,
    language: language || "auto",
    speed,
    segmentChars,
    maxSegmentBytes: provider === "google" ? GOOGLE_MAX_SEGMENT_BYTES : Number.POSITIVE_INFINITY,
    optimizeStreamingLatency,
    textNormalization
  };
}

function getDefaultSegmentChars(provider) {
  if (provider === "google") return GOOGLE_DEFAULT_SEGMENT_CHARS;
  if (provider === "gemini") return GEMINI_DEFAULT_SEGMENT_CHARS;
  return DEFAULT_SEGMENT_CHARS;
}

function sanitizeProvider(rawProvider) {
  if (rawProvider === "google") return "google";
  if (rawProvider === "gemini") return "gemini";
  return "xai";
}

function sanitizeVoice(rawVoice, fallback, provider) {
  const voice = String(rawVoice || fallback).trim();
  if (provider === "google") {
    return normalizeGeminiVoiceName(voice) || fallback;
  }

  if (provider === "gemini") {
    return GEMINI_TTS_VOICES.has(voice) ? voice : fallback;
  }

  return (voice || fallback).toLowerCase();
}

function sanitizeLanguage(rawLanguage, provider, voice) {
  const language = String(rawLanguage || "auto").trim();
  if (provider === "gemini") return language || "auto";
  if (provider !== "google") return language || "auto";
  if (language && language !== "auto") return language;
  return deriveGoogleLanguageCode(voice) || "en-US";
}

function normalizeGeminiVoiceName(voice) {
  const legacyChirpPrefix = "-Chirp3-HD-";
  const legacyChirpIndex = voice.indexOf(legacyChirpPrefix);
  const candidate = legacyChirpIndex >= 0
    ? voice.slice(legacyChirpIndex + legacyChirpPrefix.length)
    : voice;

  return GEMINI_TTS_VOICES.has(candidate) ? candidate : "";
}

function getProviderAudioEncoding(provider) {
  return provider === "gemini" || provider === "google" ? "pcm_s16le" : "mpeg";
}

function getProviderSampleRate(provider) {
  return provider === "gemini" || provider === "google" ? GEMINI_SAMPLE_RATE : 24000;
}

function buildXaiUrl(options) {
  const params = new URLSearchParams({
    language: options.language,
    voice: options.voice,
    codec: "mp3",
    sample_rate: "24000",
    bit_rate: "128000",
    speed: String(options.speed),
    optimize_streaming_latency: String(options.optimizeStreamingLatency),
    text_normalization: String(options.textNormalization)
  });

  return `${XAI_TTS_URL}?${params}`;
}

async function synthesizeGoogleSpeech(text, options, credential, signal) {
  const url = new URL(GOOGLE_TTS_URL);
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: await resolveGoogleAuthorizationHeader(credential, signal)
  };

  const requestBody = {
    input: {
      text,
      prompt: buildGeminiStylePrompt(options)
    },
    voice: {
      languageCode: options.language,
      name: options.voice,
      modelName: GEMINI_TTS_MODEL
    },
    audioConfig: {
      audioEncoding: "LINEAR16",
      sampleRateHertz: GEMINI_SAMPLE_RATE
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
    signal
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = body?.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(`Google TTS request failed: ${message}`);
  }

  if (!body?.audioContent) {
    throw new Error("Google TTS response did not include audio content.");
  }

  return extractLinear16Pcm(Buffer.from(body.audioContent, "base64"));
}

function extractLinear16Pcm(audio) {
  if (audio.length < 44) return audio;
  if (audio.toString("ascii", 0, 4) !== "RIFF" || audio.toString("ascii", 8, 12) !== "WAVE") {
    return audio;
  }

  let offset = 12;
  while (offset + 8 <= audio.length) {
    const chunkId = audio.toString("ascii", offset, offset + 4);
    const chunkSize = audio.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    const dataEnd = Math.min(dataStart + chunkSize, audio.length);

    if (chunkId === "data") {
      return audio.subarray(dataStart, dataEnd);
    }

    offset = dataStart + chunkSize + (chunkSize % 2);
  }

  return audio.subarray(44);
}

async function synthesizeGeminiSpeech(text, options, apiKey, signal) {
  const trimmedApiKey = String(apiKey || "").trim();
  if (!trimmedApiKey) {
    throw new Error("Add your Gemini API key before starting narration.");
  }

  if (/^Bearer\s+/i.test(trimmedApiKey) || trimmedApiKey.startsWith("{")) {
    throw new Error("Gemini Developer API expects an AI Studio API key, not OAuth or service account credentials.");
  }

  const response = await fetch(GEMINI_TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-goog-api-key": trimmedApiKey
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: buildGeminiPrompt(text, options)
        }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: options.voice
            }
          }
        }
      },
      model: GEMINI_TTS_MODEL
    }),
    signal
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = body?.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(`Gemini TTS request failed: ${message}`);
  }

  const audioData = body?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData?.data;
  if (!audioData) {
    throw new Error("Gemini TTS response did not include audio data.");
  }

  return Buffer.from(audioData, "base64");
}

function buildGeminiPrompt(text, options) {
  return `${buildGeminiStylePrompt(options)}\n\n${text}`;
}

function buildGeminiStylePrompt(options) {
  const pace = describeGeminiPace(options.speed);
  const paceInstruction = pace ? ` at a ${pace} pace` : "";
  return `Read the following audiobook passage aloud exactly as written${paceInstruction}.`;
}

function describeGeminiPace(speed) {
  if (speed <= 0.82) return "slow";
  if (speed < 0.96) return "slightly slow";
  if (speed >= 1.24) return "fast";
  if (speed > 1.06) return "slightly brisk";
  return "";
}

async function resolveGoogleAuthorizationHeader(credential, signal) {
  const trimmedCredential = String(credential || "").trim();
  if (!trimmedCredential) {
    const token = await getGoogleOAuthAccessToken(signal);
    return `Bearer ${token}`;
  }

  if (isGoogleApiKey(trimmedCredential)) {
    throw new Error("Google Cloud TTS does not accept API keys. Paste an OAuth access token or a service account JSON key instead.");
  }

  const serviceAccount = parseGoogleServiceAccount(trimmedCredential);
  if (serviceAccount) {
    const token = await getGoogleServiceAccountAccessToken(serviceAccount, signal);
    return `Bearer ${token}`;
  }

  return /^Bearer\s+/i.test(trimmedCredential)
    ? trimmedCredential.replace(/^Bearer\s+/i, "Bearer ")
    : `Bearer ${trimmedCredential}`;
}

function parseGoogleServiceAccount(credential) {
  if (!credential.startsWith("{")) return null;

  let parsed;
  try {
    parsed = JSON.parse(credential);
  } catch {
    throw new Error("Google service account JSON could not be parsed. Paste a valid JSON key, or paste an OAuth access token.");
  }

  if (parsed.type !== "service_account") {
    throw new Error("Google JSON credential is not a service account key. Paste a service account JSON key, or paste an OAuth access token.");
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Google service account JSON is missing client_email or private_key.");
  }

  return {
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
    privateKeyId: parsed.private_key_id || "",
    tokenUri: parsed.token_uri || GOOGLE_TOKEN_URL
  };
}

async function getGoogleServiceAccountAccessToken(serviceAccount, signal) {
  const cacheKey = `${serviceAccount.clientEmail}:${serviceAccount.privateKeyId || hashString(serviceAccount.privateKey)}`;
  const cached = googleAccessTokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.accessToken;
  }

  const assertion = createGoogleServiceAccountJwt(serviceAccount);
  const response = await fetch(serviceAccount.tokenUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    }),
    signal
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = body?.error_description || body?.error || `${response.status} ${response.statusText}`;
    throw new Error(`Google OAuth token request failed: ${message}`);
  }

  if (!body?.access_token) {
    throw new Error("Google OAuth token response did not include an access token.");
  }

  const expiresIn = Number(body.expires_in || 3600);
  googleAccessTokenCache.set(cacheKey, {
    accessToken: body.access_token,
    expiresAt: Date.now() + Math.max(60, expiresIn - 30) * 1000
  });

  return body.access_token;
}

function createGoogleServiceAccountJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  if (serviceAccount.privateKeyId) {
    header.kid = serviceAccount.privateKeyId;
  }

  const claims = {
    iss: serviceAccount.clientEmail,
    scope: GOOGLE_OAUTH_SCOPE,
    aud: serviceAccount.tokenUri,
    exp: now + 3600,
    iat: now
  };

  const signingInput = `${base64UrlJson(header)}.${base64UrlJson(claims)}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), serviceAccount.privateKey);
  return `${signingInput}.${base64Url(signature)}`;
}

function base64UrlJson(value) {
  return base64Url(Buffer.from(JSON.stringify(value), "utf8"));
}

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function hashString(value) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function isGoogleApiKey(credential) {
  return /^AIza[0-9A-Za-z_-]+$/.test(credential);
}

function deriveGoogleLanguageCode(voice) {
  const match = String(voice || "").match(/^([a-z]{2,3}-[A-Z]{2})-/);
  return match?.[1] || "";
}

function providerLabel(provider) {
  if (provider === "google") return "Google Cloud TTS";
  if (provider === "gemini") return "Gemini API";
  return "xAI";
}

function splitText(text, targetLength, maxBytes = Number.POSITIVE_INFINITY) {
  const normalized = normalizeText(text);
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const segments = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const units = paragraph.length > targetLength || byteLength(paragraph) > maxBytes
      ? splitSentences(paragraph)
      : [paragraph];

    for (const unit of units) {
      for (const piece of splitOversizedUnit(unit, targetLength, maxBytes)) {
        if (!current) {
          current = piece;
          continue;
        }

        const candidate = `${current}\n\n${piece}`;
        if (candidate.length <= targetLength && byteLength(candidate) <= maxBytes) {
          current += `\n\n${piece}`;
        } else {
          segments.push(current);
          current = piece;
        }
      }
    }
  }

  if (current) segments.push(current);
  return segments;
}

function splitSentences(text) {
  const matches = text.match(/[^.!?。！？]+[.!?。！？]+["')\]]*|[^.!?。！？]+$/g);
  return (matches || [text]).map((part) => part.trim()).filter(Boolean);
}

function splitOversizedUnit(text, targetLength, maxBytes = Number.POSITIVE_INFINITY) {
  if (text.length <= targetLength && byteLength(text) <= maxBytes) return [text];

  const pieces = [];
  let rest = text.trim();

  while (rest.length > targetLength || byteLength(rest) > maxBytes) {
    const byteCutAt = Number.isFinite(maxBytes)
      ? utf8SliceIndex(rest, maxBytes)
      : rest.length;
    const limit = Math.max(1, Math.min(targetLength, byteCutAt));
    let cutAt = rest.lastIndexOf(" ", limit);
    if (cutAt < Math.floor(targetLength * 0.6)) {
      cutAt = limit;
    }

    pieces.push(rest.slice(0, cutAt).trim());
    rest = rest.slice(cutAt).trim();
  }

  if (rest) pieces.push(rest);
  return pieces;
}

function utf8SliceIndex(text, maxBytes) {
  let bytes = 0;
  let index = 0;

  for (const char of text) {
    const charBytes = Buffer.byteLength(char, "utf8");
    if (bytes + charBytes > maxBytes) break;
    bytes += charBytes;
    index += char.length;
  }

  return index || 1;
}

function byteLength(text) {
  return Buffer.byteLength(text, "utf8");
}

function splitFixed(text, maxLength) {
  const parts = [];
  let rest = text;

  while (rest.length > maxLength) {
    parts.push(rest.slice(0, maxLength));
    rest = rest.slice(maxLength);
  }

  if (rest) parts.push(rest);
  return parts;
}

function normalizeText(text) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/[ \u00a0]{2,}/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function connectXaiWebSocket(url, apiKey) {
  const parsed = new URL(url);
  const port = Number(parsed.port || 443);
  const pathWithQuery = `${parsed.pathname}${parsed.search}`;

  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: parsed.hostname,
      port,
      servername: parsed.hostname
    });

    const key = crypto.randomBytes(16).toString("base64");
    let handshake = Buffer.alloc(0);
    let settled = false;

    const cleanup = () => {
      socket.off("secureConnect", onSecureConnect);
      socket.off("data", onHandshakeData);
      socket.off("error", onError);
      socket.off("close", onClose);
    };

    const failHandshake = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      socket.destroy();
      reject(error);
    };

    const onError = (error) => {
      failHandshake(error);
    };

    const onClose = () => {
      failHandshake(new Error("xAI WebSocket closed during handshake."));
    };

    const onSecureConnect = () => {
      socket.write([
        `GET ${pathWithQuery} HTTP/1.1`,
        `Host: ${parsed.host}`,
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Key: ${key}`,
        "Sec-WebSocket-Version: 13",
        `Authorization: Bearer ${apiKey}`,
        "\r\n"
      ].join("\r\n"));
    };

    const onHandshakeData = (chunk) => {
      handshake = Buffer.concat([handshake, chunk]);
      const headerEnd = handshake.indexOf("\r\n\r\n");
      if (headerEnd === -1) return;

      const headerText = handshake.slice(0, headerEnd).toString("utf8");
      const [statusLine] = headerText.split("\r\n");
      const statusMatch = statusLine.match(/^HTTP\/1\.1\s+(\d+)/);
      const statusCode = statusMatch ? Number(statusMatch[1]) : 0;

      if (statusCode !== 101) {
        failHandshake(new Error(`xAI rejected the WebSocket upgrade (${statusLine}).`));
        return;
      }

      settled = true;
      cleanup();

      const ws = new WebSocketConnection(socket, {
        expectMaskedFrames: false,
        maskOutgoingFrames: true
      });

      const remaining = handshake.slice(headerEnd + 4);
      if (remaining.length) {
        ws.consume(remaining);
      }

      resolve(ws);
    };

    socket.once("secureConnect", onSecureConnect);
    socket.on("data", onHandshakeData);
    socket.once("error", onError);
    socket.once("close", onClose);
  });
}

class WebSocketConnection extends EventEmitter {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(socket, options) {
    super();
    this.socket = socket;
    this.expectMaskedFrames = options.expectMaskedFrames;
    this.maskOutgoingFrames = options.maskOutgoingFrames;
    this.readyState = WebSocketConnection.OPEN;
    this.buffer = Buffer.alloc(0);
    this.fragmentOpcode = 0;
    this.fragmentBuffers = [];
    this.closeEmitted = false;

    socket.on("data", (chunk) => this.consume(chunk));
    socket.on("error", (error) => this.emit("error", error));
    socket.on("close", () => {
      this.readyState = WebSocketConnection.CLOSED;
      this.emitClose(1006, "");
    });
  }

  send(data, options = {}) {
    if (this.readyState !== WebSocketConnection.OPEN) return;

    const opcode = options.binary || Buffer.isBuffer(data) ? 0x2 : 0x1;
    const payload = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
    this.socket.write(encodeFrame(payload, opcode, this.maskOutgoingFrames));
  }

  close(code = 1000, reason = "") {
    if (this.readyState >= WebSocketConnection.CLOSING) return;

    this.readyState = WebSocketConnection.CLOSING;
    const reasonBytes = Buffer.from(reason);
    const payload = Buffer.alloc(2 + reasonBytes.length);
    payload.writeUInt16BE(code, 0);
    reasonBytes.copy(payload, 2);
    this.socket.write(encodeFrame(payload, 0x8, this.maskOutgoingFrames), () => {
      this.socket.end();
    });
  }

  terminate() {
    this.readyState = WebSocketConnection.CLOSED;
    this.socket.destroy();
  }

  consume(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const fin = Boolean(first & 0x80);
      const opcode = first & 0x0f;
      const masked = Boolean(second & 0x80);
      let length = second & 0x7f;
      let offset = 2;

      if (length === 126) {
        if (this.buffer.length < offset + 2) return;
        length = this.buffer.readUInt16BE(offset);
        offset += 2;
      } else if (length === 127) {
        if (this.buffer.length < offset + 8) return;
        const bigLength = this.buffer.readBigUInt64BE(offset);
        if (bigLength > BigInt(Number.MAX_SAFE_INTEGER)) {
          this.emit("error", new Error("WebSocket frame is too large."));
          this.terminate();
          return;
        }
        length = Number(bigLength);
        offset += 8;
      }

      const maskOffset = offset;
      if (masked) offset += 4;

      if (this.buffer.length < offset + length) return;

      if (this.expectMaskedFrames && !masked) {
        this.emit("error", new Error("Expected masked WebSocket frame."));
        this.terminate();
        return;
      }

      const mask = masked ? this.buffer.slice(maskOffset, maskOffset + 4) : null;
      const payload = Buffer.from(this.buffer.slice(offset, offset + length));
      this.buffer = this.buffer.slice(offset + length);

      if (mask) {
        for (let index = 0; index < payload.length; index += 1) {
          payload[index] ^= mask[index % 4];
        }
      }

      this.handleFrame(opcode, payload, fin);
    }
  }

  handleFrame(opcode, payload, fin) {
    if (opcode === 0x8) {
      const code = payload.length >= 2 ? payload.readUInt16BE(0) : 1000;
      const reason = payload.length > 2 ? payload.slice(2).toString("utf8") : "";
      if (this.readyState !== WebSocketConnection.CLOSING) {
        this.socket.write(encodeFrame(payload, 0x8, this.maskOutgoingFrames));
      }
      this.readyState = WebSocketConnection.CLOSED;
      this.emitClose(code, reason);
      this.socket.end();
      return;
    }

    if (opcode === 0x9) {
      this.socket.write(encodeFrame(payload, 0xA, this.maskOutgoingFrames));
      return;
    }

    if (opcode === 0xA) return;

    if (opcode === 0x0) {
      this.fragmentBuffers.push(payload);
      if (fin) {
        const message = Buffer.concat(this.fragmentBuffers);
        const messageOpcode = this.fragmentOpcode;
        this.fragmentOpcode = 0;
        this.fragmentBuffers = [];
        this.emit("message", messageOpcode === 0x1 ? message.toString("utf8") : message);
      }
      return;
    }

    if (!fin) {
      this.fragmentOpcode = opcode;
      this.fragmentBuffers = [payload];
      return;
    }

    this.emit("message", opcode === 0x1 ? payload.toString("utf8") : payload);
  }

  emitClose(code, reason) {
    if (this.closeEmitted) return;
    this.closeEmitted = true;
    this.emit("close", { code, reason });
  }
}

function encodeFrame(payload, opcode, masked) {
  const length = payload.length;
  let headerLength = 2;

  if (length >= 126 && length <= 65_535) {
    headerLength += 2;
  } else if (length > 65_535) {
    headerLength += 8;
  }

  const maskLength = masked ? 4 : 0;
  const frame = Buffer.alloc(headerLength + maskLength + length);
  frame[0] = 0x80 | opcode;

  let offset = 2;
  if (length < 126) {
    frame[1] = (masked ? 0x80 : 0) | length;
  } else if (length <= 65_535) {
    frame[1] = (masked ? 0x80 : 0) | 126;
    frame.writeUInt16BE(length, offset);
    offset += 2;
  } else {
    frame[1] = (masked ? 0x80 : 0) | 127;
    frame.writeBigUInt64BE(BigInt(length), offset);
    offset += 8;
  }

  if (masked) {
    const mask = crypto.randomBytes(4);
    mask.copy(frame, offset);
    offset += 4;

    for (let index = 0; index < payload.length; index += 1) {
      frame[offset + index] = payload[index] ^ mask[index % 4];
    }
  } else {
    payload.copy(frame, offset);
  }

  return frame;
}

async function serveStatic(req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const decodedPath = decodeURIComponent(requestedPath);
  const absolutePath = path.resolve(publicDir, `.${decodedPath}`);

  if (!absolutePath.startsWith(publicDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(res, 404, "Not found");
      return;
    }

    throw error;
  }
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function sendText(res, status, body) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(body);
}

function sendJsonWs(ws, payload) {
  if (ws.readyState === WebSocketConnection.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = parseDotEnvValue(rawValue);
  }
}

function parseDotEnvValue(rawValue) {
  const value = rawValue.trim();
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).replace(/\\n/g, "\n");
  }

  const commentIndex = value.indexOf(" #");
  return commentIndex === -1 ? value : value.slice(0, commentIndex).trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
