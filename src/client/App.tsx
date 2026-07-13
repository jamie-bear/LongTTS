import { useRef } from "react";
import { NarrationPanel } from "./components/NarrationPanel";
import { TextWorkspace } from "./components/TextWorkspace";
import { useLongTtsController } from "./hooks/useLongTtsController";

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const controller = useLongTtsController(audioRef);
  return <div className="app-frame">
    <header className="app-header">
      <a className="wordmark" href="#main-workspace" aria-label="LongTTS home"><span className="wordmark-mark" aria-hidden="true">L</span><span>LongTTS</span></a>
      <p>Long-form text to speech</p>
    </header>
    <main id="main-workspace" className="app-shell"><TextWorkspace controller={controller} /><NarrationPanel controller={controller} audioRef={audioRef} /></main>
  </div>;
}
