# LongTTS

A local audiobook web app for turning long-form text into narration through OpenRouter speech models, Gemini TTS, xAI streaming TTS, or Google Cloud Text-to-Speech voices.

## Features

- Paste a book or chapter, or load a `.txt` file.
- Pick OpenRouter, xAI, or Google Cloud TTS at runtime.
- Keep provider credentials local. OpenRouter and xAI API keys stay in the active browser/backend session; Google OAuth stores a refresh token in the ignored `.secrets` folder.
- Streams or buffers audio through a backend WebSocket proxy so provider credentials are not exposed in frontend source.
- Splits long text by paragraph and sentence, using short quality-first defaults for Gemini and Google while keeping xAI segments below the `text.delta` limit and Google segments below Cloud TTS request-size limits.
- Generates every segment sequentially after narration starts, independent of playback position, while still streaming audio for listening.
- Supports OpenRouter speech models, Voxtral zero-shot voice clones, Gemini TTS voices through Google Cloud TTS, built-in xAI voices, language selection where available, speed controls, low-latency xAI options, and xAI text normalization.
- Automatically stitches completed segments into one continuous MP3 or WAV download after generation finishes.

## Run With Docker Compose

Make sure Docker Desktop or another Docker engine is running first.

```bash
docker compose up --build
```

Then open `http://localhost:10203`.

To run in the background:

```bash
docker compose up --build -d
```

To stop:

```bash
docker compose down
```

The default container and host port is `10203`. To change it, update `PORT` and the `ports` mapping in `compose.yaml`.

## Local Node Fallback

Docker Compose is the primary path, but the app can still run directly:

```bash
node src/server.js
```

Direct Node runs also default to `http://localhost:10203`.

## Google OAuth Setup

For personal Google Cloud access, create a local `.env` file from `.env.example`:

```bash
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
```

In the Google Cloud OAuth client, add this authorized redirect URI:

```text
http://localhost:10203/oauth/google/callback
```

If your OAuth consent screen is in testing mode, add your Google account as a test user. The Cloud Text-to-Speech API must be enabled for the project, and the signed-in account needs access to use it. Gemini-TTS through Cloud Text-to-Speech also needs `aiplatform.endpoints.predict`, which can be granted with the Vertex AI User role. After restarting the app, choose Google Cloud TTS and use Connect Google. The refresh token is stored locally at `.secrets/google-oauth-token.json`, which is ignored by Git and mounted into Docker Compose for persistence.

## Provider Notes

OpenRouter uses `https://openrouter.ai/api/v1/audio/speech` for speech generation and `https://openrouter.ai/api/v1/models?output_modalities=speech` for model discovery. When a Voxtral TTS model is selected, the app also exposes saved voice management through the OpenRouter provider: create a reusable voice from reference audio, refresh the saved voice list, update voice metadata, delete saved clones, and select a saved clone for narration. Saved Voxtral clones are sent to speech generation as `voice_id`; built-in model voices are sent as `voice`.

Gemini API is the simplest Google option. It uses the Gemini Developer API endpoint `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent` with an AI Studio API key. Gemini TTS returns raw 24 kHz PCM audio, so the browser wraps it as WAV for playback and download.

For xAI, this app uses the streaming TTS endpoint, `wss://api.x.ai/v1/tts`. The official docs state that each `text.delta` message is capped at 15,000 characters, while the bidirectional WebSocket endpoint supports long total text through multiple deltas and multi-utterance sessions.

For Google Cloud TTS, this app uses Cloud Text-to-Speech `text:synthesize` at `https://texttospeech.googleapis.com/v1/text:synthesize` with `voice.modelName` set to `gemini-3.1-flash-tts-preview`. Google returns one base64 LINEAR16 payload per segment; the backend removes the WAV header and forwards 24 kHz PCM audio so the browser can play and download a continuous WAV. Cloud Gemini-TTS requires principal-backed authentication plus permission to call the model endpoint; use the local OAuth connection above before starting narration.

Gemini and Google Cloud TTS default to very short 500-character segments to avoid the quality drop that can appear in longer synthesized passages. Cloud Gemini-TTS has a 4,000-byte text-field limit per request, so the backend applies a stricter Google segment cap and checks UTF-8 byte length when splitting text.

Sources:

- https://openrouter.ai/blog/announcements/announcing-audio-apis/
- https://openrouter.ai/mistralai/voxtral-mini-tts-2603/api
- https://docs.mistral.ai/studio-api/audio/text_to_speech
- https://docs.mistral.ai/studio-api/audio/text_to_speech/voices
- https://docs.mistral.ai/studio-api/audio/text_to_speech/speech
- https://docs.x.ai/developers/model-capabilities/audio/text-to-speech
- https://docs.x.ai/developers/rest-api-reference/inference/voice
- https://ai.google.dev/gemini-api/docs/speech-generation
- https://ai.google.dev/gemini-api/docs/api-key
- https://docs.cloud.google.com/text-to-speech/docs/gemini-tts
- https://docs.cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize
- https://docs.cloud.google.com/docs/authentication
- https://docs.cloud.google.com/text-to-speech/quotas
