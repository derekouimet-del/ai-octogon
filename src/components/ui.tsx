import type { ButtonHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  tone = "ghost",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "lime" | "ghost" | "tide" | "ember" | "danger" }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40",
        tone === "lime" && "bg-lime text-lime-ink hover:bg-lime/90",
        tone === "ghost" && "border border-line bg-panel-2 text-fg hover:border-fg/30",
        tone === "tide" && "bg-tide text-tide-ink hover:bg-tide/90",
        tone === "ember" && "bg-ember text-ember-ink hover:bg-ember/90",
        tone === "danger" && "border border-ember/50 text-ember hover:bg-ember/10",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  children,
  action,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between gap-3 text-xs font-medium tracking-wide text-muted uppercase">
        <span>{label}</span>
        {action}
      </span>
      {children}
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

const control =
  "w-full rounded-lg border border-line bg-ink px-3 py-2.5 text-sm text-fg outline-none placeholder:text-muted/70 focus:border-lime";

export function TextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-24 resize-y", className)} {...props} />;
}

export function SelectInput({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, className)} {...props} />;
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-xl border border-line bg-panel", className)}>{children}</section>;
}

export function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "lime" | "tide" | "ember";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "muted" && "bg-panel-2 text-muted",
        tone === "lime" && "bg-lime text-lime-ink",
        tone === "tide" && "bg-tide/15 text-tide",
        tone === "ember" && "bg-ember/15 text-ember",
      )}
    >
      {children}
    </span>
  );
}
