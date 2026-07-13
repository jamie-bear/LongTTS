import { useRef } from "react";
import { NarrationPanel } from "./components/NarrationPanel";
import { TextWorkspace } from "./components/TextWorkspace";
import { useLongTtsController } from "./hooks/useLongTtsController";

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const controller = useLongTtsController(audioRef);
  return <main className="app-shell"><TextWorkspace controller={controller} /><NarrationPanel controller={controller} audioRef={audioRef} /></main>;
}
