import type { ChangeEvent } from "react";
import type { useLongTtsController } from "../hooks/useLongTtsController";
import { ProviderSetup } from "./ProviderSetup";
import { Button } from "./ui/Controls";

type Controller = ReturnType<typeof useLongTtsController>;

export function TextWorkspace({ controller }: { controller: Controller }) {
  const { state, stats, actions } = controller;
  const loadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void actions.loadTextFile(file);
    event.target.value = "";
  };
  return <section className="reader-panel" aria-label="Text and narration setup">
    <div className="masthead"><div className="brand-lockup"><h1><span>Long</span>TTS</h1></div><div className="meter-stack" aria-label="Text statistics"><span>{stats.chars.toLocaleString()} chars</span><span>{stats.cost}</span></div></div>
    <ProviderSetup controller={controller} />
    <div className="text-toolbar"><label className="file-button" htmlFor="fileInput">Load .txt</label><input id="fileInput" type="file" accept=".txt,text/plain" onChange={loadFile} /><Button type="button" onClick={actions.loadSample}>Sample</Button><Button type="button" onClick={actions.clearText}>Clear</Button></div>
    <label className="text-label" htmlFor="bookText">Book or chapter text</label>
    <textarea id="bookText" spellCheck value={state.text} onChange={(event) => actions.setText(event.target.value)} placeholder="Paste book or chapter text here." />
  </section>;
}
