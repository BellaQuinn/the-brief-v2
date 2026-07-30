"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-signal text-background hover:bg-signal-bright",
  secondary: "border border-border bg-surface text-ink-primary hover:bg-surface-raised",
  danger: "border border-status-atRisk/40 text-status-atRisk hover:bg-status-atRisk/10",
  ghost: "text-ink-secondary hover:text-ink-primary hover:bg-surface-raised",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
