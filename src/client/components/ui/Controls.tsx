import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import type { SelectOption } from "../../types/contracts";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`button ${className}`.trim()} />;
}

export function SelectField({ id, label, options, helper, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { id: string; label: string; options: SelectOption[]; helper?: ReactNode }) {
  return <label className="field" htmlFor={id}><span className="field-label">{label}</span><select id={id} {...props}>{options.map((option, index) => <option key={`${option.value}-${index}`} value={option.value} disabled={option.disabled}>{option.label}</option>)}</select>{helper && <small className="field-help">{helper}</small>}</label>;
}

export function Checkbox({ id, label, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: ReactNode }) {
  return <label className="checkline" htmlFor={id}><input id={id} type="checkbox" {...props} /><span>{label}</span></label>;
}

export function FieldPanel({ id, className = "", children, live = false }: { id?: string; className?: string; children: ReactNode; live?: boolean }) {
  return <div id={id} className={className} aria-live={live ? "polite" : undefined}>{children}</div>;
}
