import type { ChangeEvent } from "react";
import type { useBigTtsController } from "../hooks/useBigTtsController";
import { Button } from "./ui/Controls";
import { Icon } from "./ui/Icon";

type Controller = ReturnType<typeof useBigTtsController>;

export function TextWorkspace({ controller }: { controller: Controller }) {
  const { state, stats, actions } = controller;
  const loadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void actions.loadTextFile(file);
    event.target.value = "";
  };
  return <section className="card editor-card" aria-labelledby="source-heading">
    <div className="section-heading">
      <div><p className="eyebrow">Source</p><h1 id="source-heading">Text workspace</h1><p>Paste a chapter, article, or any long-form text.</p></div>
      <div className="text-metrics" aria-label="Text statistics"><strong>{stats.chars.toLocaleString()}</strong><span>characters</span><span className="metric-divider" aria-hidden="true" /><span>{stats.cost}</span></div>
    </div>
    <div className="text-toolbar">
      <label className="button file-button" htmlFor="fileInput"><Icon name="file" />Load .txt</label><input id="fileInput" type="file" accept=".txt,text/plain" onChange={loadFile} />
      <Button type="button" onClick={actions.loadSample}><Icon name="spark" />Use sample</Button>
      <Button type="button" className="button-quiet" onClick={actions.clearText}><Icon name="trash" />Clear</Button>
    </div>
    <label className="sr-only" htmlFor="bookText">Book or chapter text</label>
    <textarea id="bookText" spellCheck value={state.text} onChange={(event) => actions.setText(event.target.value)} placeholder="Paste or type the text you want to narrate…" />
  </section>;
}
