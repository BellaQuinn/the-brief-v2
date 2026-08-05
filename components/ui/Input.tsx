"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Focus uses accent (blue) rather than signal (green) — green stays a
// status/success color, focus is a functional/informational state.
const fieldClasses =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink-primary outline-none transition-colors placeholder:text-ink-tertiary focus:border-accent focus:ring-2 focus:ring-accent/15";

function FieldLabel({ label, htmlFor }: { label?: string; htmlFor?: string }) {
  if (!label) return null;
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm text-ink-secondary">
      {label}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className, ...props },
  ref
) {
  return (
    <div>
      <FieldLabel label={label} htmlFor={id} />
      <input ref={ref} id={id} className={cn(fieldClasses, className)} {...props} />
    </div>
  );
});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, id, className, ...props },
  ref
) {
  return (
    <div>
      <FieldLabel label={label} htmlFor={id} />
      <textarea ref={ref} id={id} className={cn(fieldClasses, "resize-none", className)} {...props} />
    </div>
  );
});
